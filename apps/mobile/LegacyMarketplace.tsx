import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_URL, DEMO_MODE, ApiError } from './src/api';
import { demoPinEligible, groupCart, parseSavedCart, serviceablePin, updateCart, validPin } from './src/core';
import { copy } from './src/i18n';
import { sampleListings } from './src/seed';
import type { CartLine, Language, Listing, MarketplaceOrder, Serviceability, Session } from './src/types';

type Tab = 'discover' | 'orders' | 'bulk' | 'account';
const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const theme = { green: '#184d36', ink: '#172d23', muted: '#647369', orange: '#c96c29', bg: '#f7f9f5', line: '#e0e7df' };

function Button({ title, onPress, secondary = false, disabled = false, busy = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; busy?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, (disabled || busy) && s.disabled, pressed && { opacity: 0.8 }]}>{busy ? <ActivityIndicator color={secondary ? theme.green : '#fff'} /> : <Text style={[s.buttonText, secondary && { color: theme.green }]}>{title}</Text>}</Pressable>;
}
function Field({ label, value, onChangeText, keyboardType = 'default', multiline = false, maxLength, placeholder }: { label: string; value: string; onChangeText: (text: string) => void; keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'phone-pad'; multiline?: boolean; maxLength?: number; placeholder?: string }) {
  return <View style={s.fieldWrap}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={keyboardType} maxLength={maxLength} multiline={multiline} placeholder={placeholder} placeholderTextColor="#7a877d" style={[s.input, multiline && { minHeight: 96, textAlignVertical: 'top' }]} /></View>;
}

function Marketplace() {
  const [lang, setLang] = useState<Language>('en');
  const t = copy[lang];
  const [tab, setTab] = useState<Tab>('discover');
  const [pin, setPin] = useState('400008');
  const [pinDraft, setPinDraft] = useState('400008');
  const [pinModal, setPinModal] = useState(false);
  const [listings, setListings] = useState<Listing[]>(sampleListings);
  const [sample, setSample] = useState(!API_URL);
  const [loading, setLoading] = useState(false);
  const [serviceArea, setServiceArea] = useState<Serviceability | null>(null);
  const [checkingArea, setCheckingArea] = useState(false);
  const [areaError, setAreaError] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState('');
  const [basketOpen, setBasketOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState('');
  const [otp, setOtp] = useState('');
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqQty, setRfqQty] = useState('');
  const [rfqDate, setRfqDate] = useState('');
  const [rfqNotes, setRfqNotes] = useState('');
  const [sellerListings, setSellerListings] = useState<Listing[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [listingTitle, setListingTitle] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingStock, setListingStock] = useState('');
  const [listingMoq, setListingMoq] = useState('1');
  const checkoutKey = useRef(`native-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const refreshVersion = useRef(0);

  async function refresh() {
    const version = ++refreshVersion.current;
    setServiceArea(null); setAreaError(false);
    if (!API_URL) { setSample(true); setListings(sampleListings); setCheckingArea(false); setLoading(false); return; }
    setLoading(true); setCheckingArea(true); setError('');
    const [catalogResult, areaResult] = await Promise.allSettled([api.catalog(pin), api.serviceability(pin)]);
    if (version !== refreshVersion.current) return;
    if (catalogResult.status === 'fulfilled') { setListings(catalogResult.value); setSample(false); }
    else { setError((catalogResult.reason as Error).message); setSample(true); setListings(sampleListings); }
    if (areaResult.status === 'fulfilled' && areaResult.value.pin === pin && typeof areaResult.value.serviceable === 'boolean') setServiceArea(areaResult.value);
    else setAreaError(true);
    setCheckingArea(false); setLoading(false);
  }
  useEffect(() => {
    void Promise.all([AsyncStorage.getItem('khetsetu.cart'), AsyncStorage.getItem('khetsetu.preferences'), api.restoreSession()]).then(([saved, preferences, restored]) => {
      setCart(parseSavedCart(saved)); setSession(restored);
      if (preferences) { try { const value = JSON.parse(preferences); if (value.lang === 'en' || value.lang === 'hi') setLang(value.lang); if (typeof value.pin === 'string' && validPin(value.pin)) setPin(value.pin); } catch { /* Corrupt preferences safely return to defaults. */ } }
    }).catch(() => setError('Device storage is unavailable. This session will not be saved.')).finally(() => setStorageReady(true));
  }, []);
  useEffect(() => { void refresh(); }, [pin]);
  useEffect(() => { if (storageReady) void AsyncStorage.setItem('khetsetu.cart', JSON.stringify(cart)).catch(() => setError('Your basket could not be saved to this device.')); checkoutKey.current = `native-${Date.now()}-${Math.random().toString(36).slice(2)}`; }, [cart, storageReady, pin]);
  useEffect(() => { if (storageReady) void AsyncStorage.setItem('khetsetu.preferences', JSON.stringify({ lang, pin })).catch(() => {}); }, [lang, pin, storageReady]);
  useEffect(() => { if (tab === 'orders' && session) void loadOrders(); }, [tab, session]);
  useEffect(() => { if (tab === 'account' && session?.user.role === 'seller') void guarded(async () => setSellerListings(await api.sellerListings(session.accessToken))); }, [tab, session]);

  async function guarded(action: () => Promise<void>) {
    setBusy(true);
    try { await action(); }
    catch (e) { if (e instanceof ApiError && e.status === 401) { await api.logout(); setSession(null); setTab('account'); } Alert.alert(lang === 'hi' ? 'कार्रवाई पूरी नहीं हुई' : 'Could not continue', (e as Error).message); }
    finally { setBusy(false); }
  }
  async function loadOrders() {
    if (!session) return;
    setLoading(true); setError('');
    try { setOrders(await api.orders(session.accessToken)); }
    catch (e) { setError((e as Error).message); if (e instanceof ApiError && e.status === 401) { setSession(null); await api.logout(); } }
    finally { setLoading(false); }
  }
  const filtered = useMemo(() => listings.filter(item => (category === 'All' || item.category === category) && `${item.title} ${item.sellerName} ${item.location}`.toLowerCase().includes(search.toLowerCase())), [listings, category, search]);
  const basket = useMemo(() => { try { return { groups: groupCart(cart, listings), issue: '' }; } catch (e) { return { groups: [], issue: (e as Error).message }; } }, [cart, listings]);
  const total = basket.groups.reduce((sum, group) => sum + group.subtotal, 0);
  const pinReady = !sample && !checkingArea && serviceablePin(pin, serviceArea);
  const areaMessage = !API_URL && demoPinEligible(pin) ? t.nationalPreview : checkingArea ? t.checkingService : areaError || !serviceArea ? t.uncheckedService : serviceArea.serviceable ? t.eligibleDevelopment : `${t.unavailablePin}${serviceArea.message ? ` ${serviceArea.message}` : ''}`;

  function add(item: Listing, amount: number) {
    try { setCart(current => updateCart(current, item, amount)); setSelected(null); }
    catch (e) { Alert.alert('Check quantity', (e as Error).message); }
  }
  function needLogin() { setBasketOpen(false); setTab('account'); Alert.alert(t.signin, t.loginhint); }
  function openProduct(item: Listing) { setSelected(item); setQuantity(String(cart.find(line => line.listingId === item.id)?.quantity ?? item.minimumQuantity)); }
  function openEditor(item: Listing | null) {
    setEditing(item); setListingTitle(item?.title ?? ''); setListingPrice(String(item?.price ?? '')); setListingStock(String(item?.availableQuantity ?? '')); setListingMoq(String(item?.minimumQuantity ?? 1)); setEditorOpen(true);
  }
  async function saveListing() {
    if (!session) return;
    const price = Number(listingPrice), availableQuantity = Number(listingStock), minimumQuantity = Number(listingMoq);
    if (!listingTitle.trim() || !Number.isFinite(price) || price <= 0 || !Number.isFinite(availableQuantity) || availableQuantity < 0 || !Number.isFinite(minimumQuantity) || minimumQuantity <= 0) { Alert.alert('Check listing', 'Enter a title, positive price and minimum quantity, and stock of zero or more.'); return; }
    await guarded(async () => {
      if (editing) await api.updateListing(session.accessToken, editing.id, { title: listingTitle.trim(), price, availableQuantity, minimumQuantity });
      else await api.createListing(session.accessToken, { title: listingTitle.trim(), category: 'Vegetables', unit: 'kg', price, availableQuantity, minimumQuantity, grade: 'A' });
      setSellerListings(await api.sellerListings(session.accessToken)); setEditorOpen(false); await refresh();
    });
  }
  function sellerInventory() { return <View style={s.panel}><Text style={s.sectionTitle}>{t.inventory}</Text><Text style={s.body}>Create a Grade A vegetable listing in kg, edit stock, or pause a listing. Additional categories and attributes are available in the web workspace.</Text><Button title={lang === 'hi' ? 'नई सूची जोड़ें' : 'New listing'} onPress={() => openEditor(null)} />{sellerListings.map(item => <View key={item.id} style={s.inventoryRow}><Text style={s.productTitle}>{item.title}</Text><Text style={s.small}>{item.availableQuantity} {item.unit} · {money(item.price)} / {item.unit} · {item.status ?? 'active'}</Text><View style={s.twoButtons}><Button title={lang === 'hi' ? 'बदलें' : 'Edit stock'} secondary onPress={() => openEditor(item)} /><Button title={item.status === 'paused' ? 'Resume' : 'Pause'} secondary busy={busy} onPress={() => void guarded(async () => { if (!session) return; await api.updateListing(session.accessToken, item.id, { status: item.status === 'paused' ? 'active' : 'paused' }); setSellerListings(await api.sellerListings(session.accessToken)); })} /></View></View>)}</View>; }
  async function checkout() {
    if (!session) { needLogin(); return; }
    if (sample) { Alert.alert('Sample browsing', 'Connect the API and reload the live catalogue before reserving produce. No order or payment has been created.'); return; }
    if (!pinReady) { Alert.alert(t.pin, areaMessage); return; }
    await guarded(async () => {
      const result = await api.checkout(session.accessToken, pin, cart, checkoutKey.current);
      setOrders(result.orders);
      setCart([]); setBasketOpen(false); setTab('orders');
      Alert.alert(t.reservation, `${result.payment.reason ?? t.secured}\n\n${result.orders.map(order => order.id).join('\n')}`);
    });
  }

  const card = (item: Listing) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}, ${money(item.price)} per ${item.unit}, ${t.minimum} ${item.minimumQuantity} ${item.unit}`} onPress={() => openProduct(item)} style={s.product}>
    <View style={s.productImageWrap}><Image source={{ uri: item.image }} accessibilityIgnoresInvertColors style={s.productImage} /><View style={s.gradeTag}><Text style={s.gradeText}>{item.organic ? 'Organic' : `Grade ${item.grade}`}</Text></View></View>
    <View style={s.productBody}><Text style={s.micro}>{item.location.split(',')[0]} · {item.category}</Text><Text style={s.productTitle}>{item.title}</Text><Text style={s.small} numberOfLines={1}>{item.sellerName}</Text><View style={s.rowBetween}><View><Text style={s.price}>{money(item.price)}<Text style={s.small}> / {item.unit}</Text></Text><Text style={s.micro}>{t.minimum} {item.minimumQuantity} {item.unit}</Text></View><View style={s.plus}><Text style={s.plusText}>+</Text></View></View></View>
  </Pressable>;

  function discover() { return <>
    <View style={s.hero}><Text style={s.eyebrow}>{lang === 'hi' ? 'खेत से बाज़ार तक' : 'FROM GOOD GROWERS, WITH CARE'}</Text><Text style={s.heroTitle}>{t.fresh}</Text><Text style={s.heroBody}>{t.subtitle}</Text><View style={s.heroFooter}><Text style={s.heroPill}>✓ {t.verified}</Text><Text style={s.heroPill}>₹ INR</Text></View></View>
    <View style={s.search}><Text style={s.searchGlyph}>⌕</Text><TextInput accessibilityLabel={t.search} value={search} onChangeText={setSearch} placeholder={t.search} style={s.searchInput} placeholderTextColor="#6b786f" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{(['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses'] as const).map((value, i) => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: category === value }} style={[s.chip, category === value && s.chipActive]} onPress={() => setCategory(value)}><Text style={[s.chipText, category === value && { color: '#fff' }]}>{[t.all, t.vegetables, t.fruits, t.grains, t.pulses][i]}</Text></Pressable>)}</ScrollView>
    <View style={s.sectionHead}><Text style={s.sectionTitle}>{t.nearby}</Text><Text style={s.micro}>{filtered.length} {t.items}</Text></View>
    <View style={s.warning}><Text accessibilityRole="alert" style={s.warningText}>{areaMessage}</Text></View>
    <View style={s.grid}>{filtered.map(card)}</View>{filtered.length === 0 && <Text style={s.emptyText}>{t.noresults}</Text>}
    <View style={s.bulkBanner}><Text style={s.sectionTitle}>{t.rfqtitle}</Text><Text style={s.body}>{t.rfqbody}</Text><Button title={t.bulk} secondary onPress={() => setTab('bulk')} /></View>
  </>; }
  function orderScreen() { return <><Text style={s.pageTitle}>{t.orders}</Text>{!session ? <View style={s.empty}><Text style={s.emptyIcon}>▤</Text><Text style={s.sectionTitle}>{t.signin}</Text><Text style={s.emptyText}>{t.loginhint}</Text><Button title={t.signin} onPress={() => setTab('account')} /></View> : orders.length === 0 ? <View style={s.empty}><Text style={s.emptyIcon}>▤</Text><Text style={s.sectionTitle}>{t.noorders}</Text><Text style={s.emptyText}>{t.orderhint}</Text><Button title={t.browse} onPress={() => setTab('discover')} /></View> : orders.map(order => <View key={order.id} style={s.panel}><View style={s.rowBetween}><Text style={s.productTitle}>{order.id.slice(0, 18)}</Text><Text style={s.badge}>{order.status.replace(/_/g, ' ')}</Text></View><Text style={s.small}>{order.sellerId}</Text>{order.items?.map((item, index) => <Text key={index} style={s.body}>{item.title ?? 'Produce'} · {item.quantity} {item.unit}</Text>)}<Text style={s.price}>{money(order.totalPaise !== undefined ? order.totalPaise / 100 : order.total ?? order.totalAmount ?? 0)}</Text><Text style={s.small}>{order.paymentStatus ?? t.pending}</Text><Text style={s.micro}>{t.secured}</Text>{session?.user.role === 'seller' && ['placed', 'accepted', 'packed'].includes(order.status) && <Button title={order.status === 'placed' ? 'Accept order' : order.status === 'accepted' ? 'Mark packed' : 'Dispatch order'} busy={busy} onPress={() => void guarded(async () => { await api.transitionOrder(session.accessToken, order.id, order.status === 'placed' ? 'accepted' : order.status === 'accepted' ? 'packed' : 'dispatched'); await loadOrders(); })} />}{session?.user.role === 'buyer' && order.status === 'delivered' && <Button title={lang === 'hi' ? 'प्राप्ति की पुष्टि करें' : 'Confirm received'} busy={busy} onPress={() => void guarded(async () => { await api.transitionOrder(session.accessToken, order.id, 'completed'); await loadOrders(); })} />}</View>)}<Button title={t.retry} secondary onPress={() => void loadOrders()} disabled={!session} /></>; }
  function bulkScreen() { return <><View style={s.hero}><Text style={s.eyebrow}>KHETSETU BUSINESS</Text><Text style={s.heroTitle}>{t.rfqtitle}</Text><Text style={s.heroBody}>{t.rfqbody}</Text></View><View style={s.panel}><Field label={t.produce} value={rfqTitle} onChangeText={setRfqTitle} placeholder="e.g. Grade A tomatoes" /><Field label={t.quantity} value={rfqQty} onChangeText={setRfqQty} keyboardType="decimal-pad" /><Field label={t.needby} value={rfqDate} onChangeText={setRfqDate} placeholder="2026-12-01" /><Field label={t.notes} value={rfqNotes} onChangeText={setRfqNotes} multiline /><Text style={s.small}>{t.pin}: {pin}. {areaMessage}</Text><Button title={t.sendrfq} busy={busy} disabled={!pinReady} onPress={() => {
    if (!session) { needLogin(); return; }
    if (!pinReady) { Alert.alert(t.pin, areaMessage); return; }
    if (!rfqTitle.trim() || Number(rfqQty) <= 0 || !Number.isFinite(Number(rfqQty)) || !/^\d{4}-\d{2}-\d{2}$/.test(rfqDate) || Number.isNaN(Date.parse(rfqDate))) { Alert.alert('Check requirement', 'Add produce, a positive quantity, and a valid delivery date.'); return; }
    void guarded(async () => { const result = await api.createRfq(session.accessToken, { title: rfqTitle, category: 'Vegetables', quantity: Number(rfqQty), unit: 'kg', pin, deliveryBy: new Date(rfqDate).toISOString(), notes: rfqNotes }); Alert.alert('Requirement submitted', `Reference: ${result.id}. Compare quotations in your web buyer workspace.`); setRfqTitle(''); setRfqQty(''); setRfqNotes(''); });
  }} /></View></>; }
  function accountScreen() { return <><Text style={s.pageTitle}>{t.settings}</Text><View style={s.panel}><Text style={s.sectionTitle}>{t.language}</Text><View style={s.twoButtons}><Button title="English" secondary={lang !== 'en'} onPress={() => setLang('en')} /><Button title="हिन्दी" secondary={lang !== 'hi'} onPress={() => setLang('hi')} /></View></View><View style={s.panel}>
    {session ? <><Text style={s.sectionTitle}>{session.user.role === 'seller' ? t.sellerdash : t.buyers}</Text><Text style={s.small}>{session.user.id}</Text><Button title={t.signout} secondary onPress={() => void guarded(async () => { await api.logout(); setSession(null); setOrders([]); })} /></> : <><Text style={s.sectionTitle}>{t.signin}</Text><Text style={s.body}>{t.loginhint}</Text><Field label={t.phone} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={13} placeholder="+919876543210" />{challenge ? <><Field label={t.otp} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} /><Button title={t.verify} busy={busy} onPress={() => void guarded(async () => { const next = await api.verifyOtp(challenge, otp); await api.saveSession(next); setSession(next); setChallenge(''); setOtp(''); })} /></> : <Button title={t.signin} busy={busy} onPress={() => { if (!/^(\+91)?[6-9]\d{9}$/.test(phone)) { Alert.alert('Check phone number', 'Enter a valid Indian mobile number.'); return; } void guarded(async () => { const result = await api.requestOtp(phone.startsWith('+91') ? phone : `+91${phone}`); setChallenge(result.challengeId); }); }} />}<Text style={s.micro}>{t.consent}</Text>{DEMO_MODE && <View style={s.demoLogin}><Text style={s.label}>{t.demo}</Text><Text style={s.small}>Local development accounts only. No SMS is sent.</Text><View style={s.twoButtons}><Button title={t.buyers} secondary busy={busy} onPress={() => void guarded(async () => setSession(await api.demoLogin('buyer')))} /><Button title={t.seller} secondary busy={busy} onPress={() => void guarded(async () => setSession(await api.demoLogin('seller')))} /></View></View>}</>}
  </View>{session?.user.role === 'seller' && sellerInventory()}<View style={s.panel}><Text style={s.sectionTitle}>{t.support}</Text><Text style={s.body}>{t.privacy}</Text><Text style={s.small}>India-wide development scope; location eligibility and fulfilment are controlled by the API. Account deletion, data export, disputes, refunds and policy publishing require the deployed service and operations team. This native MVP does not expose these actions.</Text></View></>; }

  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}><StatusBar style="dark" /><View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="KhetSetu home" onPress={() => setTab('discover')}><Text style={s.brand}>❧ KhetSetu<Text style={s.brandDot}>.</Text></Text><Text style={s.brandCaption}>GROWN WITH TRUST</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { setPinDraft(pin); setPinModal(true); }} style={s.location}><Text style={s.micro}>{t.pin}</Text><Text style={s.locationText}>⌖ {pin} ⌄</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`${t.basket}, ${cart.length} ${t.items}`} onPress={() => setBasketOpen(true)} style={s.basketIcon}><Text style={{ fontSize: 24, color: theme.green }}>▱</Text>{cart.length > 0 && <Text style={s.count}>{cart.length}</Text>}</Pressable></View>
    {(sample || error) && <View style={s.status}><Text style={s.statusText}>{error || t.sample}</Text>{error && <Pressable accessibilityRole="button" style={s.retry} onPress={() => void refresh()}><Text style={s.retryText}>{t.retry}</Text></Pressable>}</View>}
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void (tab === 'orders' ? loadOrders() : refresh())} tintColor={theme.green} />}>
      {loading && <View style={s.loading}><ActivityIndicator color={theme.green} /><Text style={s.small}>{t.loading}</Text></View>}{tab === 'discover' ? discover() : tab === 'orders' ? orderScreen() : tab === 'bulk' ? bulkScreen() : accountScreen()}
    </ScrollView></KeyboardAvoidingView>
    <View style={s.nav}>{(['discover', 'orders', 'bulk', 'account'] as const).map((name, index) => <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: tab === name }} onPress={() => { setTab(name); setError(''); }} style={s.navItem}><Text style={[s.navGlyph, tab === name && { color: theme.green }]}>{['⌂', '▤', '▦', '○'][index]}</Text><Text style={[s.navLabel, tab === name && { color: theme.green, fontWeight: '700' }]}>{t[name]}</Text></Pressable>)}</View>
    <Modal visible={editorOpen} animationType="slide" onRequestClose={() => setEditorOpen(false)}><SafeAreaView style={s.safe}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content, { gap: 16 }]}><Text style={s.pageTitle}>{editing ? 'Edit listing' : 'New listing'}</Text><Text style={s.body}>Vegetables · kg · Grade A. The server checks seller verification, ownership and reserved inventory.</Text><Field label="Produce title" value={listingTitle} onChangeText={setListingTitle} /><Field label="Price (INR per kg)" value={listingPrice} onChangeText={setListingPrice} keyboardType="decimal-pad" /><Field label="Available stock (kg)" value={listingStock} onChangeText={setListingStock} keyboardType="decimal-pad" /><Field label="Minimum order (kg)" value={listingMoq} onChangeText={setListingMoq} keyboardType="decimal-pad" /><Button title={t.save} busy={busy} onPress={() => void saveListing()} /><Button title={t.close} secondary onPress={() => setEditorOpen(false)} /></ScrollView></KeyboardAvoidingView></SafeAreaView></Modal>
    <Modal visible={pinModal} animationType="slide" transparent onRequestClose={() => setPinModal(false)}><View style={s.modalShade}><View style={s.sheet}><Text style={s.sectionTitle}>{t.pin}</Text><Text style={s.body}>{t.nationalLocation}</Text><Field label={t.pin} value={pinDraft} onChangeText={setPinDraft} keyboardType="number-pad" maxLength={6} /><Button title={t.save} onPress={() => { if (!validPin(pinDraft)) { Alert.alert('Check PIN code', 'Enter a six-digit Indian PIN code.'); return; } setPin(pinDraft); setPinModal(false); }} /><Button title={t.close} secondary onPress={() => setPinModal(false)} /></View></View></Modal>
    <Modal visible={selected !== null} animationType="slide" onRequestClose={() => setSelected(null)}><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>{selected && <><Button title={t.close} secondary onPress={() => setSelected(null)} /><Image source={{ uri: selected.image }} style={s.detailImage} /><Text style={s.eyebrowDark}>{t.detail}</Text><Text style={s.pageTitle}>{selected.title}</Text><Text style={s.price}>{money(selected.price)} / {selected.unit}</Text><Text style={s.body}>✓ {selected.sellerName}</Text><Text style={s.small}>{selected.location}</Text><View style={s.panel}><Text style={s.body}>{t.grade}: {selected.grade} · {t.available}: {selected.availableQuantity} {selected.unit}</Text><Text style={s.body}>{t.minimum}: {selected.minimumQuantity} {selected.unit}</Text><Text style={s.body}>{t.harvest}: {selected.harvestDate.slice(0, 10)}</Text>{selected.tiers?.map((tier, i) => <Text key={i} style={s.body}>{tier.minimumQuantity ?? tier.minQuantity}+ {selected.unit}: {money(tier.price)} / {selected.unit}</Text>)}</View><Field label={`Quantity (${selected.unit})`} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" /><Button title={t.add} onPress={() => add(selected, Number(quantity))} disabled={selected.availableQuantity <= 0} /></>}</ScrollView></SafeAreaView></Modal>
    <Modal visible={basketOpen} animationType="slide" onRequestClose={() => setBasketOpen(false)}><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><View style={s.rowBetween}><Text style={s.pageTitle}>{t.basket}</Text><Button title={t.close} secondary onPress={() => setBasketOpen(false)} /></View>{cart.length === 0 ? <View style={s.empty}><Text style={s.emptyText}>{t.empty}</Text><Button title={t.browse} onPress={() => { setBasketOpen(false); setTab('discover'); }} /></View> : basket.issue ? <View style={s.panel}><Text style={s.warningText}>{basket.issue}</Text><Button title="Clear unavailable basket" secondary onPress={() => setCart([])} /></View> : <>{basket.groups.map(group => <View key={group.sellerId} style={s.panel}><Text style={s.sectionTitle}>{group.sellerName}</Text><Text style={s.micro}>Separate order, payment and fulfilment</Text>{group.items.map(({ listing, quantity: qty, price }) => <View key={listing.id} style={s.cartLine}><View style={{ flex: 1 }}><Text style={s.productTitle}>{listing.title}</Text><Text style={s.small}>{qty} {listing.unit} × {money(price)}</Text><Text style={s.price}>{money(qty * price)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${listing.title}`} style={s.remove} onPress={() => setCart(current => current.filter(line => line.listingId !== listing.id))}><Text style={s.removeText}>Remove</Text></Pressable></View>)}<Text style={s.label}>{t.total}: {money(group.subtotal)}</Text></View>)}<View style={s.panel}><View style={s.rowBetween}><Text style={s.sectionTitle}>{t.total}</Text><Text style={s.price}>{money(total)}</Text></View><Text style={s.small}>{t.fees}</Text><Text style={s.small}>{t.pin}: {pin}</Text><Text accessibilityRole="alert" style={s.small}>{areaMessage}</Text><Button title={t.checkout} busy={busy} disabled={!pinReady} onPress={() => void checkout()} /><Text style={s.micro}>Payment is never marked successful without a verified provider event. Stock is rechecked by the server.</Text></View></>}</ScrollView></SafeAreaView></Modal>
  </SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><Marketplace /></SafeAreaProvider>; }

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: theme.line }, brand: { fontSize: 24, fontWeight: '800', color: theme.green, letterSpacing: -1 }, brandDot: { color: theme.orange }, brandCaption: { fontSize: 9, letterSpacing: 2, color: theme.muted, marginLeft: 23 }, location: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, locationText: { fontSize: 15, color: theme.ink, fontWeight: '700' }, basketIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.line, borderRadius: 14 }, count: { position: 'absolute', top: -5, right: -5, color: '#fff', backgroundColor: theme.orange, borderRadius: 10, overflow: 'hidden', minWidth: 19, textAlign: 'center', padding: 2, fontSize: 11, fontWeight: '700' },
  content: { padding: 18, paddingBottom: 28 }, status: { paddingLeft: 18, paddingRight: 10, paddingVertical: 9, backgroundColor: '#fcf1d9', flexDirection: 'row', alignItems: 'center', gap: 8 }, statusText: { fontSize: 12, lineHeight: 18, color: '#75571f', flex: 1 }, retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, retryText: { fontSize: 14, color: theme.green, fontWeight: '700' }, hero: { padding: 25, borderRadius: 24, backgroundColor: theme.green, marginBottom: 22 }, eyebrow: { color: '#d0dfae', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }, heroTitle: { fontSize: 34, lineHeight: 40, letterSpacing: -1.2, color: '#fff', fontWeight: '700', marginBottom: 12 }, heroBody: { color: '#dae8dc', fontSize: 16, lineHeight: 25 }, heroFooter: { marginTop: 22, flexDirection: 'row', gap: 8 }, heroPill: { color: '#fff', backgroundColor: '#38654d', borderRadius: 8, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7, fontSize: 12 }, search: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }, searchGlyph: { fontSize: 29, color: theme.muted, marginRight: 8 }, searchInput: { flex: 1, fontSize: 16, color: theme.ink, minHeight: 50 }, chips: { gap: 8, paddingVertical: 18 }, chip: { minHeight: 44, borderWidth: 1, borderColor: theme.line, backgroundColor: '#fff', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 24 }, chipActive: { backgroundColor: theme.green, borderColor: theme.green }, chipText: { fontSize: 14, color: theme.ink, fontWeight: '500' }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 16, gap: 8 }, sectionTitle: { fontSize: 20, lineHeight: 27, fontWeight: '700', color: theme.ink, flexShrink: 1 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, product: { width: '48%', flexGrow: 1, minWidth: 140, maxWidth: '50%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.line }, productImageWrap: { height: 142, backgroundColor: '#e7eee4' }, productImage: { width: '100%', height: '100%', resizeMode: 'cover' }, gradeTag: { position: 'absolute', top: 9, left: 9, backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 5 }, gradeText: { fontSize: 10, fontWeight: '700', color: theme.green }, productBody: { padding: 12, gap: 7 }, productTitle: { fontSize: 16, lineHeight: 22, color: theme.ink, fontWeight: '700' }, micro: { color: theme.muted, fontSize: 12, lineHeight: 18 }, small: { color: theme.muted, fontSize: 14, lineHeight: 21 }, price: { color: theme.green, fontSize: 21, lineHeight: 29, fontWeight: '700' }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, plus: { minWidth: 40, minHeight: 44, borderRadius: 10, backgroundColor: '#eaf1e9', justifyContent: 'center', alignItems: 'center' }, plusText: { fontSize: 26, color: theme.green }, bulkBanner: { borderRadius: 20, marginTop: 24, padding: 22, backgroundColor: '#edf2e3', gap: 12 }, body: { fontSize: 16, lineHeight: 25, color: theme.muted }, pageTitle: { fontSize: 30, lineHeight: 38, fontWeight: '700', color: theme.ink, letterSpacing: -0.6, marginVertical: 12 }, panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 18, padding: 20, marginBottom: 16, gap: 12 }, button: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.green, borderRadius: 12 }, buttonText: { fontSize: 16, lineHeight: 23, fontWeight: '700', color: '#fff', textAlign: 'center' }, secondary: { borderWidth: 1, borderColor: '#c7d6c7', backgroundColor: '#f5f8f1' }, disabled: { opacity: 0.4 }, fieldWrap: { gap: 8 }, label: { color: theme.ink, fontSize: 14, lineHeight: 21, fontWeight: '600' }, input: { minHeight: 52, borderWidth: 1, borderColor: '#cdd9cc', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, lineHeight: 24, color: theme.ink, backgroundColor: '#fff' }, empty: { alignItems: 'center', gap: 18, paddingVertical: 50, paddingHorizontal: 20 }, emptyIcon: { fontSize: 60, color: '#a7bda3' }, emptyText: { fontSize: 16, lineHeight: 26, color: theme.muted, textAlign: 'center', marginVertical: 10 }, warning: { padding: 15, backgroundColor: '#fff0da', borderRadius: 12, marginBottom: 16 }, warningText: { color: '#8b4c18', fontSize: 15, lineHeight: 23 }, nav: { flexDirection: 'row', borderTopWidth: 1, borderColor: theme.line, backgroundColor: '#fff', paddingTop: 9, paddingBottom: 7 }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 54, gap: 3 }, navGlyph: { fontSize: 25, color: '#8e9a90' }, navLabel: { fontSize: 12, color: theme.muted }, twoButtons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' }, demoLogin: { borderTopWidth: 1, borderColor: theme.line, paddingTop: 16, gap: 12 }, inventoryRow: { borderTopWidth: 1, borderColor: theme.line, paddingTop: 12, gap: 6 }, modalShade: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,30,18,.4)' }, sheet: { padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.bg, gap: 16 }, detailImage: { width: '100%', height: 280, borderRadius: 20, marginTop: 20, marginBottom: 24, backgroundColor: '#e6ede0' }, eyebrowDark: { fontSize: 12, fontWeight: '700', color: theme.green, letterSpacing: 1.5 }, cartLine: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.line }, remove: { minHeight: 44, minWidth: 60, justifyContent: 'center', alignItems: 'center' }, removeText: { color: '#a34625', fontSize: 14 }, badge: { fontSize: 12, lineHeight: 19, color: '#745315', backgroundColor: '#fcf0d5', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, overflow: 'hidden', maxWidth: 150 }, loading: { padding: 16, flexDirection: 'row', gap: 12, justifyContent: 'center' }
});
