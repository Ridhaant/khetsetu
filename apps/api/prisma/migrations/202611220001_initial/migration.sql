-- Initial PostgreSQL/PostGIS schema. Not executed in the authoring environment.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "phoneHash" TEXT UNIQUE,
  "email" TEXT UNIQUE,
  "role" TEXT NOT NULL DEFAULT 'buyer',
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMPTZ(3)
);

CREATE TABLE "Profile" (
  "userId" TEXT NOT NULL PRIMARY KEY,
  "displayName" TEXT NOT NULL,
  "buyerType" TEXT NOT NULL DEFAULT 'household',
  "language" TEXT NOT NULL DEFAULT 'en',
  "consentVersion" TEXT NOT NULL,
  "consentAt" TIMESTAMPTZ(3) NOT NULL
);

CREATE TABLE "Address" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "line1" TEXT NOT NULL,
  "line2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pin" TEXT NOT NULL,
  "instructions" TEXT,
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7)
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "refreshTokenHash" TEXT NOT NULL UNIQUE,
  "familyId" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "revokedAt" TIMESTAMPTZ(3)
);

CREATE TABLE "SellerProfile" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "sellerType" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "originPin" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "payoutRef" TEXT,
  "compliance" JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE "Verification" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "sellerId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "documentRef" TEXT NOT NULL,
  "rejectionReason" TEXT,
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameHi" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "variety" TEXT NOT NULL,
  "attributes" JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE "Listing" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "sellerId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "grade" TEXT NOT NULL,
  "pricePaise" INTEGER NOT NULL,
  "minimumMilli" INTEGER NOT NULL DEFAULT 1000,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "pricingMode" TEXT NOT NULL DEFAULT 'fixed',
  "organic" BOOLEAN NOT NULL DEFAULT false,
  "harvestDate" DATE,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "InventoryLot" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "listingId" TEXT NOT NULL UNIQUE,
  "stockMilli" INTEGER NOT NULL,
  "reservedMilli" INTEGER NOT NULL DEFAULT 0,
  "version" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "PriceTier" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "listingId" TEXT NOT NULL,
  "minMilli" INTEGER NOT NULL,
  "pricePaise" INTEGER NOT NULL
);

CREATE TABLE "Checkout" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "buyerId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "pin" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending_payment',
  "totalPaise" INTEGER NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "response" JSONB
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "checkoutId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending_payment',
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  "subtotalPaise" INTEGER NOT NULL,
  "feePaise" INTEGER NOT NULL DEFAULT 0,
  "taxPaise" INTEGER NOT NULL DEFAULT 0,
  "deliveryPaise" INTEGER NOT NULL DEFAULT 0,
  "totalPaise" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "quantityMilli" INTEGER NOT NULL,
  "unitPricePaise" INTEGER NOT NULL,
  "lineTotalPaise" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "checkoutId" TEXT NOT NULL UNIQUE,
  "provider" TEXT NOT NULL DEFAULT 'razorpay',
  "providerOrderId" TEXT UNIQUE,
  "providerPaymentId" TEXT UNIQUE,
  "amountPaise" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'received',
  "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMPTZ(3)
);

CREATE TABLE "Refund" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "amountPaise" INTEGER NOT NULL,
  "providerRefundId" TEXT UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'requested',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Payout" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "sellerId" TEXT NOT NULL,
  "providerRef" TEXT UNIQUE,
  "grossPaise" INTEGER NOT NULL,
  "feePaise" INTEGER NOT NULL,
  "netPaise" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "settledAt" TIMESTAMPTZ(3)
);

CREATE TABLE "RFQ" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "buyerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "quantityMilli" INTEGER NOT NULL,
  "pin" TEXT NOT NULL,
  "deliveryBy" TIMESTAMPTZ(3) NOT NULL,
  "notes" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE "Quote" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "rfqId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "unitPricePaise" INTEGER NOT NULL,
  "quantityMilli" INTEGER NOT NULL,
  "validUntil" TIMESTAMPTZ(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "notes" TEXT NOT NULL
);

CREATE TABLE "Shipment" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "partner" TEXT NOT NULL,
  "assignedTo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "trackingRef" TEXT,
  "proofRef" TEXT,
  "pickupAt" TIMESTAMPTZ(3),
  "deliveredAt" TIMESTAMPTZ(3)
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "orderId" TEXT NOT NULL UNIQUE,
  "buyerId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "verifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Dispute" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "internalNotes" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "resolution" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Conversation" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "contextType" TEXT NOT NULL,
  "contextId" TEXT NOT NULL,
  "participants" JSONB NOT NULL
);

CREATE TABLE "Message" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "reported" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "key" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Promotion" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "rule" JSONB NOT NULL,
  "startsAt" TIMESTAMPTZ(3) NOT NULL,
  "endsAt" TIMESTAMPTZ(3) NOT NULL
);

CREATE TABLE "CommissionRule" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "name" TEXT NOT NULL,
  "basisPoints" INTEGER NOT NULL,
  "config" JSONB NOT NULL,
  "effectiveAt" TIMESTAMPTZ(3) NOT NULL
);

CREATE TABLE "ServiceArea" (
  "pin" TEXT NOT NULL PRIMARY KEY,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "deliveryPaise" INTEGER NOT NULL DEFAULT 4900,
  "freeAbovePaise" INTEGER NOT NULL DEFAULT 100000,
  "boundary" geography(MultiPolygon,4326)
);

CREATE TABLE "SupportTicket" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Cart" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "buyerId" TEXT NOT NULL UNIQUE,
  "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Negotiation" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "contextId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "offers" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CatalogueOption" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "config" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "MediaObject" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL UNIQUE,
  "contentType" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "scanStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OutboxEvent" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "topic" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Verification" ADD CONSTRAINT "Verification_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PriceTier" ADD CONSTRAINT "PriceTier_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payout" ADD CONSTRAINT "Payout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RFQ" ADD CONSTRAINT "RFQ_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Address_userId_idx" ON "Address" ("userId");

CREATE INDEX "Session_familyId_idx" ON "Session" ("familyId");

CREATE INDEX "Verification_status_idx" ON "Verification" ("status");

CREATE INDEX "Listing_status_expiresAt_idx" ON "Listing" ("status", "expiresAt");

CREATE INDEX "Listing_sellerId_idx" ON "Listing" ("sellerId");

CREATE UNIQUE INDEX "PriceTier_listingId_minMilli_key" ON "PriceTier" ("listingId", "minMilli");

CREATE UNIQUE INDEX "Checkout_buyerId_key_key" ON "Checkout" ("buyerId", "key");

CREATE INDEX "Checkout_status_expiresAt_idx" ON "Checkout" ("status", "expiresAt");

CREATE INDEX "Order_sellerId_status_idx" ON "Order" ("sellerId", "status");

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" ("orderId");

CREATE INDEX "AuditLog_targetId_createdAt_idx" ON "AuditLog" ("targetId", "createdAt");

CREATE UNIQUE INDEX "CatalogueOption_kind_name_key" ON "CatalogueOption" ("kind", "name");

CREATE INDEX "OutboxEvent_status_createdAt_idx" ON "OutboxEvent" ("status", "createdAt");

ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_nonnegative" CHECK ("stockMilli" >= 0 AND "reservedMilli" >= 0 AND "reservedMilli" <= "stockMilli");

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_price_moq" CHECK ("pricePaise" > 0 AND "minimumMilli" > 0);

ALTER TABLE "PriceTier" ADD CONSTRAINT "PriceTier_positive" CHECK ("minMilli" > 0 AND "pricePaise" > 0);

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_positive" CHECK ("quantityMilli" > 0 AND "unitPricePaise" > 0 AND "lineTotalPaise" >= 0);

ALTER TABLE "Refund" ADD CONSTRAINT "Refund_positive" CHECK ("amountPaise" > 0);

ALTER TABLE "Review" ADD CONSTRAINT "Review_rating" CHECK ("rating" BETWEEN 1 AND 5);

CREATE INDEX "ServiceArea_boundary_gist" ON "ServiceArea" USING GIST ("boundary");

CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'AuditLog is append-only'; END; $$;

CREATE TRIGGER "AuditLog_immutable" BEFORE UPDATE OR DELETE ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();

CREATE FUNCTION protect_order_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."snapshot" IS DISTINCT FROM OLD."snapshot" OR NEW."sellerId" <> OLD."sellerId" OR NEW."checkoutId" <> OLD."checkoutId" OR NEW."subtotalPaise" <> OLD."subtotalPaise" OR NEW."feePaise" <> OLD."feePaise" OR NEW."taxPaise" <> OLD."taxPaise" OR NEW."deliveryPaise" <> OLD."deliveryPaise" OR NEW."totalPaise" <> OLD."totalPaise" THEN
    RAISE EXCEPTION 'Order commercial snapshots are immutable';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER "Order_snapshot_immutable" BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION protect_order_snapshot();

CREATE FUNCTION reject_order_item_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'OrderItem snapshots are immutable'; END; $$;

CREATE TRIGGER "OrderItem_immutable" BEFORE UPDATE OR DELETE ON "OrderItem" FOR EACH ROW EXECUTE FUNCTION reject_order_item_mutation();
