"""One-time initial migration emitter for this checked-in schema; use Prisma for later migrations."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
schema = (root / 'prisma/schema.prisma').read_text()
models = re.findall(r'model (\w+) \{\n(.*?)\n\}', schema, re.S)
names = {name for name, _ in models}
parts = ['-- Initial PostgreSQL/PostGIS schema. Not executed in the authoring environment.',
         'CREATE EXTENSION IF NOT EXISTS postgis;', 'CREATE EXTENSION IF NOT EXISTS pgcrypto;']
constraints = []
indexes = []
for name, block in models:
    columns = []
    for line in block.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith('@@'):
            match = re.match(r'@@(unique|index)\(\[([^]]+)\]\)', line)
            if match:
                kind, values = match.groups()
                keys = [v.strip() for v in values.split(',')]
                key_sql = ', '.join(f'"{v}"' for v in keys)
                idx = f'{name}_{"_".join(keys)}_{"key" if kind == "unique" else "idx"}'
                indexes.append(f'CREATE {"UNIQUE " if kind == "unique" else ""}INDEX "{idx}" ON "{name}" ({key_sql});')
            continue
        match = re.match(r'(\w+)\s+(\S+)(.*)', line)
        if not match:
            raise ValueError(line)
        field, datatype, attrs = match.groups()
        base = datatype.rstrip('?[]')
        if base in names:
            relation = re.search(r'@relation\(fields:\s*\[([^]]+)\],\s*references:\s*\[([^]]+)\](.*?)\)', attrs)
            if relation:
                own, refs, more = relation.groups()
                own_sql = ', '.join(f'"{v.strip()}"' for v in own.split(','))
                ref_sql = ', '.join(f'"{v.strip()}"' for v in refs.split(','))
                deletion = 'CASCADE' if 'onDelete:Cascade' in more else 'RESTRICT'
                constraint_name = f'{name}_{"_".join(v.strip() for v in own.split(","))}_fkey'
                constraints.append(f'ALTER TABLE "{name}" ADD CONSTRAINT "{constraint_name}" FOREIGN KEY ({own_sql}) REFERENCES "{base}" ({ref_sql}) ON DELETE {deletion} ON UPDATE CASCADE;')
            continue
        if base == 'String':
            sqltype = 'TEXT'
        elif base == 'Int':
            sqltype = 'INTEGER'
        elif base == 'Boolean':
            sqltype = 'BOOLEAN'
        elif base == 'Json':
            sqltype = 'JSONB'
        elif base == 'Decimal':
            sqltype = 'DECIMAL(10,7)'
        elif base == 'DateTime':
            sqltype = 'DATE' if '@db.Date' in attrs and '@db.Timestamptz' not in attrs else 'TIMESTAMPTZ(3)'
        elif datatype.startswith('Unsupported('):
            sqltype = 'geography(MultiPolygon,4326)'
        else:
            raise ValueError(datatype)
        sql = f'"{field}" {sqltype}'
        if not datatype.endswith('?'):
            sql += ' NOT NULL'
        if '@default(uuid())' in attrs or '@default(dbgenerated("gen_random_uuid()::text"))' in attrs:
            sql += ' DEFAULT gen_random_uuid()::text'
        elif '@default(now())' in attrs:
            sql += ' DEFAULT CURRENT_TIMESTAMP'
        else:
            default = re.search(r'@default\(("[^"]*"|true|false|\d+)\)', attrs)
            if default:
                value = default.group(1)
                if value.startswith('"'):
                    value = "'" + value[1:-1].replace("'", "''") + "'" + ('::jsonb' if base == 'Json' else '')
                sql += f' DEFAULT {value}'
        if '@id' in attrs:
            sql += ' PRIMARY KEY'
        elif '@unique' in attrs:
            sql += ' UNIQUE'
        columns.append(sql)
    parts.append(f'CREATE TABLE "{name}" (\n  ' + ',\n  '.join(columns) + '\n);')
parts += constraints + indexes
parts += [
    'ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_nonnegative" CHECK ("stockMilli" >= 0 AND "reservedMilli" >= 0 AND "reservedMilli" <= "stockMilli");',
    'ALTER TABLE "Listing" ADD CONSTRAINT "Listing_price_moq" CHECK ("pricePaise" > 0 AND "minimumMilli" > 0);',
    'ALTER TABLE "PriceTier" ADD CONSTRAINT "PriceTier_positive" CHECK ("minMilli" > 0 AND "pricePaise" > 0);',
    'ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_positive" CHECK ("quantityMilli" > 0 AND "unitPricePaise" > 0 AND "lineTotalPaise" >= 0);',
    'ALTER TABLE "Refund" ADD CONSTRAINT "Refund_positive" CHECK ("amountPaise" > 0);',
    'ALTER TABLE "Review" ADD CONSTRAINT "Review_rating" CHECK ("rating" BETWEEN 1 AND 5);',
    'CREATE INDEX "ServiceArea_boundary_gist" ON "ServiceArea" USING GIST ("boundary");',
    '''CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'AuditLog is append-only'; END; $$;''',
    'CREATE TRIGGER "AuditLog_immutable" BEFORE UPDATE OR DELETE ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();',
    '''CREATE FUNCTION protect_order_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."snapshot" IS DISTINCT FROM OLD."snapshot" OR NEW."sellerId" <> OLD."sellerId" OR NEW."checkoutId" <> OLD."checkoutId" OR NEW."subtotalPaise" <> OLD."subtotalPaise" OR NEW."feePaise" <> OLD."feePaise" OR NEW."taxPaise" <> OLD."taxPaise" OR NEW."deliveryPaise" <> OLD."deliveryPaise" OR NEW."totalPaise" <> OLD."totalPaise" THEN
    RAISE EXCEPTION 'Order commercial snapshots are immutable';
  END IF;
  RETURN NEW;
END; $$;''',
    'CREATE TRIGGER "Order_snapshot_immutable" BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION protect_order_snapshot();',
    '''CREATE FUNCTION reject_order_item_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'OrderItem snapshots are immutable'; END; $$;''',
    'CREATE TRIGGER "OrderItem_immutable" BEFORE UPDATE OR DELETE ON "OrderItem" FOR EACH ROW EXECUTE FUNCTION reject_order_item_mutation();',
]
target = root / 'prisma/migrations/202611220001_initial/migration.sql'
target.write_text('\n\n'.join(parts) + '\n')
print(f'Wrote {len(models)} tables to {target.name}; not database-validated.')
