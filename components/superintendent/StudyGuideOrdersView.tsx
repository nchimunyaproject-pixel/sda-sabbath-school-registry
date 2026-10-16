import React, { useState, useMemo } from 'react';
import { StudyGuideOrder, ChurchMember } from '../../types';
import { STUDY_GUIDE_PRICES } from '../../constants';
import { useCurrency } from '../../utils/currency';
import { 
  BookOpen, Plus, Search, Filter, CheckCircle2, Clock, 
  Truck, Check, Edit2, Trash2, Printer, AlertCircle, 
  User, Phone, Mail, Calendar, FileText, ChevronDown, 
  X, CheckSquare, Coins, Layers, ArrowUpDown, Tag
} from 'lucide-react';

interface StudyGuideOrdersViewProps {
  orders: StudyGuideOrder[];
  onAddOrder: (order: Omit<StudyGuideOrder, 'id' | 'churchId' | 'orderNumber'>) => void;
  onUpdateOrder: (id: string, updates: Partial<StudyGuideOrder>) => void;
  onDeleteOrder: (id: string) => void;
  churchMembers: ChurchMember[];
  superintendentName?: string;
}

export const StudyGuideOrdersView: React.FC<StudyGuideOrdersViewProps> = ({
  orders,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  churchMembers,
  superintendentName = 'Sister R. Simpasa'
}) => {
  const { formatCurrency } = useCurrency();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedGuideType, setSelectedGuideType] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('all');

  // Modals
  const [isTakeOrderModalOpen, setIsTakeOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<StudyGuideOrder | null>(null);
  const [orderForReceipt, setOrderForReceipt] = useState<StudyGuideOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<StudyGuideOrder | null>(null);
  const [isAbcRequisitionModalOpen, setIsAbcRequisitionModalOpen] = useState(false);
  const [requisitionQuarter, setRequisitionQuarter] = useState('Q4 2026');

  // Form State for Taking / Editing Order
  const [isManualMember, setIsManualMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberContact, setMemberContact] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [guideType, setGuideType] = useState<StudyGuideOrder['guideType']>('Adult Standard');
  const [quarter, setQuarter] = useState('Q4 2026');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(STUDY_GUIDE_PRICES['Adult Standard'] || 35);
  const [paymentStatus, setPaymentStatus] = useState<StudyGuideOrder['paymentStatus']>('paid');
  const [paymentMethod, setPaymentMethod] = useState<NonNullable<StudyGuideOrder['paymentMethod']>>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(35);
  const [orderStatus, setOrderStatus] = useState<StudyGuideOrder['orderStatus']>('placed');
  const [notes, setNotes] = useState('');

  // Handle guide type change to auto-update unit price
  const handleGuideTypeChange = (newType: StudyGuideOrder['guideType']) => {
    setGuideType(newType);
    const standardPrice = STUDY_GUIDE_PRICES[newType] || 35;
    setUnitPrice(standardPrice);
    if (paymentStatus === 'paid') {
      setAmountPaid(standardPrice * quantity);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, newQty);
    setQuantity(qty);
    if (paymentStatus === 'paid') {
      setAmountPaid(unitPrice * qty);
    }
  };

  // Handle member selection from dropdown
  const handleMemberSelect = (memId: string) => {
    setSelectedMemberId(memId);
    if (memId) {
      const found = churchMembers.find(m => m.id === memId);
      if (found) {
        setMemberName(found.name);
        setMemberContact(found.contact || '');
        setMemberEmail(found.email || '');
      }
    } else {
      setMemberName('');
      setMemberContact('');
      setMemberEmail('');
    }
  };

  // Open "Take Order" modal
  const handleOpenTakeOrder = () => {
    setIsManualMember(false);
    setSelectedMemberId('');
    setMemberName('');
    setMemberContact('');
    setMemberEmail('');
    setGuideType('Adult Standard');
    setQuarter('Q4 2026');
    setQuantity(1);
    const defaultPrice = STUDY_GUIDE_PRICES['Adult Standard'] || 35;
    setUnitPrice(defaultPrice);
    setPaymentStatus('paid');
    setPaymentMethod('Cash');
    setAmountPaid(defaultPrice);
    setOrderStatus('placed');
    setNotes('');
    setIsTakeOrderModalOpen(true);
  };

  // Open "Edit Order" modal
  const handleOpenEditOrder = (ord: StudyGuideOrder) => {
    setOrderToEdit(ord);
    setIsManualMember(!ord.memberId);
    setSelectedMemberId(ord.memberId || '');
    setMemberName(ord.memberName);
    setMemberContact(ord.memberContact);
    setMemberEmail(ord.memberEmail || '');
    setGuideType(ord.guideType);
    setQuarter(ord.quarter);
    setQuantity(ord.quantity);
    setUnitPrice(ord.unitPrice);
    setPaymentStatus(ord.paymentStatus);
    setPaymentMethod(ord.paymentMethod || 'Cash');
    setAmountPaid(ord.amountPaid);
    setOrderStatus(ord.orderStatus);
    setNotes(ord.notes || '');
  };

  // Submit New Order
  const handleSubmitTakeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const totalAmount = quantity * unitPrice;
    const calculatedAmountPaid = 
      paymentStatus === 'paid' ? totalAmount : 
      paymentStatus === 'pending' ? 0 : 
      Math.min(amountPaid, totalAmount);

    onAddOrder({
      orderDate: new Date().toISOString().split('T')[0],
      memberId: isManualMember ? undefined : selectedMemberId || undefined,
      memberName: memberName.trim(),
      memberContact: memberContact.trim(),
      memberEmail: memberEmail.trim() || undefined,
      guideType,
      quarter,
      quantity,
      unitPrice,
      totalAmount,
      paymentStatus,
      amountPaid: calculatedAmountPaid,
      paymentMethod: paymentStatus !== 'pending' ? paymentMethod : undefined,
      paymentDate: paymentStatus !== 'pending' ? new Date().toISOString().split('T')[0] : undefined,
      orderStatus,
      distributedDate: orderStatus === 'distributed' ? new Date().toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
      takenBySuperintendent: superintendentName
    });

    setIsTakeOrderModalOpen(false);
  };

  // Submit Edited Order
  const handleSubmitEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToEdit || !memberName.trim()) return;

    const totalAmount = quantity * unitPrice;
    const calculatedAmountPaid = 
      paymentStatus === 'paid' ? totalAmount : 
      paymentStatus === 'pending' ? 0 : 
      Math.min(amountPaid, totalAmount);

    onUpdateOrder(orderToEdit.id, {
      memberId: isManualMember ? undefined : selectedMemberId || undefined,
      memberName: memberName.trim(),
      memberContact: memberContact.trim(),
      memberEmail: memberEmail.trim() || undefined,
      guideType,
      quarter,
      quantity,
      unitPrice,
      totalAmount,
      paymentStatus,
      amountPaid: calculatedAmountPaid,
      paymentMethod: paymentStatus !== 'pending' ? paymentMethod : undefined,
      orderStatus,
      distributedDate: orderStatus === 'distributed' && !orderToEdit.distributedDate 
        ? new Date().toISOString().split('T')[0] 
        : orderToEdit.distributedDate,
      notes: notes.trim() || undefined
    });

    setOrderToEdit(null);
  };

  // Quick Action: Mark Paid
  const handleQuickMarkPaid = (ord: StudyGuideOrder) => {
    onUpdateOrder(ord.id, {
      paymentStatus: 'paid',
      amountPaid: ord.totalAmount,
      paymentMethod: ord.paymentMethod || 'Cash',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  // Quick Action: Mark Received from ABC
  const handleQuickMarkReceived = (ord: StudyGuideOrder) => {
    onUpdateOrder(ord.id, {
      orderStatus: 'received_from_abc'
    });
  };

  // Quick Action: Mark Distributed to Member
  const handleQuickMarkDistributed = (ord: StudyGuideOrder) => {
    onUpdateOrder(ord.id, {
      orderStatus: 'distributed',
      distributedDate: new Date().toISOString().split('T')[0]
    });
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      // Search
      const matchesSearch = 
        ord.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.memberContact.includes(searchQuery) ||
        ord.guideType.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Quarter
      if (selectedQuarter !== 'all' && ord.quarter !== selectedQuarter) return false;

      // Guide Type
      if (selectedGuideType !== 'all' && ord.guideType !== selectedGuideType) return false;

      // Payment Status
      if (selectedPaymentStatus !== 'all' && ord.paymentStatus !== selectedPaymentStatus) return false;

      // Order Status
      if (selectedOrderStatus !== 'all' && ord.orderStatus !== selectedOrderStatus) return false;

      return true;
    });
  }, [orders, searchQuery, selectedQuarter, selectedGuideType, selectedPaymentStatus, selectedOrderStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalCopies = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = orders.reduce((sum, o) => sum + o.amountPaid, 0);
    const totalPending = totalValue - totalPaid;
    const distributedCount = orders.filter(o => o.orderStatus === 'distributed').reduce((sum, o) => sum + o.quantity, 0);
    const awaitingDistribution = totalCopies - distributedCount;

    return {
      totalOrders,
      totalCopies,
      totalValue,
      totalPaid,
      totalPending,
      distributedCount,
      awaitingDistribution
    };
  }, [orders]);

  // ABC Requisition aggregation by guide edition for a quarter
  const abcRequisitionData = useMemo(() => {
    const quarterOrders = orders.filter(o => o.quarter === requisitionQuarter && o.orderStatus !== 'cancelled');
    const breakdown: Record<string, { count: number; totalZMW: number }> = {};

    Object.keys(STUDY_GUIDE_PRICES).forEach(guide => {
      breakdown[guide] = { count: 0, totalZMW: 0 };
    });

    quarterOrders.forEach(o => {
      if (!breakdown[o.guideType]) {
        breakdown[o.guideType] = { count: 0, totalZMW: 0 };
      }
      breakdown[o.guideType].count += o.quantity;
      breakdown[o.guideType].totalZMW += o.totalAmount;
    });

    return breakdown;
  }, [orders, requisitionQuarter]);

  // Distinct Quarters in system
  const availableQuarters = useMemo(() => {
    const setQ = new Set<string>(['Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2026']);
    orders.forEach(o => setQ.add(o.quarter));
    return Array.from(setQ);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              SDA Church Manual • Sabbath School Helps
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              Superintendent Direct Order Desk
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-2">Member Bible Study Guide Orders</h2>
          <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
            "The Sabbath School superintendent is charged with ensuring that each church member, family, and child 
            is supplied with the General Conference Bible Study Guides. The superintendent takes personal orders from members, 
            tracks payments, and consolidates the requisition for the Adventist Book Center (ABC)."
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAbcRequisitionModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            ABC Requisition Summary
          </button>
          <button
            onClick={handleOpenTakeOrder}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            + Take Member Order
          </button>
        </div>
      </div>

      {/* Live Financial & Order Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Member Orders</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{metrics.totalOrders}</span>
          <span className="text-[10px] font-bold text-slate-500">{metrics.totalCopies} Total Copies</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Value</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{formatCurrency(metrics.totalValue)}</span>
          <span className="text-[10px] font-bold text-slate-500">Gross Requisition</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Collected (Paid)</span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">{formatCurrency(metrics.totalPaid)}</span>
          <span className="text-[10px] font-bold text-emerald-600">
            {metrics.totalValue > 0 ? Math.round((metrics.totalPaid / metrics.totalValue) * 100) : 0}% Paid
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Pending Balance</span>
          <span className="text-xl font-black text-amber-700 mt-0.5 block">{formatCurrency(metrics.totalPending)}</span>
          <span className="text-[10px] font-bold text-amber-600">To be Collected</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">Distributed</span>
          <span className="text-xl font-black text-blue-900 mt-0.5 block">{metrics.distributedCount}</span>
          <span className="text-[10px] font-bold text-blue-600">Handed to Members</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Awaiting Pickup</span>
          <span className="text-xl font-black text-slate-700 mt-0.5 block">{metrics.awaitingDistribution}</span>
          <span className="text-[10px] font-bold text-slate-400">Copies in Stock</span>
        </div>
      </div>

      {/* Filters, Search & View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member name, phone, or order #..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-700"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Quarter Filter */}
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Quarters</option>
              {availableQuarters.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            {/* Guide Type Filter */}
            <select
              value={selectedGuideType}
              onChange={(e) => setSelectedGuideType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Study Guide Editions</option>
              {Object.keys(STUDY_GUIDE_PRICES).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Payments</option>
              <option value="paid">Fully Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Pending Payment</option>
            </select>

            {/* Fulfillment Filter */}
            <select
              value={selectedOrderStatus}
              onChange={(e) => setSelectedOrderStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Distribution Status</option>
              <option value="placed">Placed / Pending ABC</option>
              <option value="received_from_abc">Received from ABC</option>
              <option value="distributed">Distributed to Member</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            Member Orders Ledger ({filteredOrders.length})
          </span>
          <span className="text-xs font-bold text-slate-500">
            Current Quarter: <strong className="text-slate-900">Q4 2026</strong>
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-black text-slate-700">No Study Guide Orders Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No member orders match your search criteria or filter. Click the "+ Take Member Order" button to log a new request.
            </p>
            <button
              onClick={handleOpenTakeOrder}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Take Order Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Order Ref & Date</th>
                  <th className="py-3.5 px-4">Member Name & Contact</th>
                  <th className="py-3.5 px-4">Guide Edition & Quarter</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-4 text-right">Amount (ZMW)</th>
                  <th className="py-3.5 px-4 text-center">Payment Status</th>
                  <th className="py-3.5 px-4 text-center">Fulfillment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order Ref & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-black text-slate-900">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {ord.orderDate}
                      </div>
                    </td>

                    {/* Member Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        {ord.memberName}
                        {ord.memberId && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md">
                            Roster Member
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {ord.memberContact || 'No phone recorded'}
                      </div>
                      {ord.notes && (
                        <div className="text-[10px] text-amber-700 italic mt-0.5 max-w-xs truncate">
                          "{ord.notes}"
                        </div>
                      )}
                    </td>

                    {/* Guide Edition & Quarter */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="font-bold text-slate-900">{ord.guideType}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {ord.quarter} • @ {formatCurrency(ord.unitPrice)}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg font-black text-slate-800 text-xs">
                        {ord.quantity}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-black text-slate-900">{formatCurrency(ord.totalAmount)}</div>
                      {ord.paymentStatus === 'partially_paid' && (
                        <div className="text-[10px] text-amber-600 font-bold">
                          Paid: {formatCurrency(ord.amountPaid)}
                        </div>
                      )}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {ord.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Paid ({ord.paymentMethod || 'Cash'})
                        </span>
                      ) : ord.paymentStatus === 'partially_paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Partially Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-black uppercase">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Unpaid
                        </span>
                      )}
                    </td>

                    {/* Order Fulfillment Status */}
                    <td className="py-3.5 px-4 text-center">
                      {ord.orderStatus === 'distributed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-md text-[10px] font-black">
                          <Check className="w-3 h-3 text-blue-700" />
                          Distributed
                        </span>
                      ) : ord.orderStatus === 'received_from_abc' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-md text-[10px] font-black">
                          <Truck className="w-3 h-3 text-purple-700" />
                          At SS Desk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Requisition Placed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Payment Action */}
                        {ord.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => handleQuickMarkPaid(ord)}
                            title="Mark Order as Paid"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold transition-all"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick Receive from ABC */}
                        {ord.orderStatus === 'placed' && (
                          <button
                            onClick={() => handleQuickMarkReceived(ord)}
                            title="Mark Received from ABC"
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[10px] font-bold transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick Distribute to Member */}
                        {ord.orderStatus !== 'distributed' && (
                          <button
                            onClick={() => handleQuickMarkDistributed(ord)}
                            title="Mark Distributed to Member"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Print Receipt / Slip */}
                        <button
                          onClick={() => setOrderForReceipt(ord)}
                          title="Print Member Order Slip"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Order */}
                        <button
                          onClick={() => handleOpenEditOrder(ord)}
                          title="Edit Order Details"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => setOrderToDelete(ord)}
                          title="Delete Order"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: TAKE NEW MEMBER ORDER */}
      {isTakeOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Superintendent Order Desk
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Take Member Study Guide Order</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Record study guide requisition for church member or family unit.
                </p>
              </div>
              <button
                onClick={() => setIsTakeOrderModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTakeOrder} className="space-y-4">
              {/* Member Selection Toggle */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Church Member Selection:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualMember(!isManualMember);
                      if (!isManualMember) {
                        setSelectedMemberId('');
                      }
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    {isManualMember ? '← Select from Church Roster' : '+ Non-Roster / Manual Entry'}
                  </button>
                </div>

                {!isManualMember ? (
                  <div>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => handleMemberSelect(e.target.value)}
                      required={!isManualMember}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="">-- Choose Church Member --</option>
                      {churchMembers.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contact || 'No phone'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Sister M. Zulu or Brother Phiri"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={memberContact}
                      onChange={(e) => setMemberContact(e.target.value)}
                      placeholder="+260 97X XXXXXX"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="member@adventist.org"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Guide Edition & Quarter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Study Guide Edition *</label>
                  <select
                    value={guideType}
                    onChange={(e) => handleGuideTypeChange(e.target.value as StudyGuideOrder['guideType'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {Object.keys(STUDY_GUIDE_PRICES).map(g => (
                      <option key={g} value={g}>{g} (ZMW {STUDY_GUIDE_PRICES[g]})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Quarter *</label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Q4 2026">Q4 2026 (Upcoming)</option>
                    <option value="Q1 2027">Q1 2027</option>
                    <option value="Q2 2027">Q2 2027</option>
                    <option value="Q3 2026">Q3 2026 (Current)</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Copies (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Unit Price (ZMW)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={unitPrice}
                    onChange={(e) => {
                      const up = parseFloat(e.target.value) || 0;
                      setUnitPrice(up);
                      if (paymentStatus === 'paid') setAmountPaid(up * quantity);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Total Cost</label>
                  <div className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 text-center">
                    {formatCurrency(quantity * unitPrice)}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Payment Information</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('paid');
                      setAmountPaid(quantity * unitPrice);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black border text-center transition-all ${
                      paymentStatus === 'paid' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('partially_paid');
                      setAmountPaid(Math.round((quantity * unitPrice) / 2));
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black border text-center transition-all ${
                      paymentStatus === 'partially_paid' 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Partial Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('pending');
                      setAmountPaid(0);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black border text-center transition-all ${
                      paymentStatus === 'pending' 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Pending Payment
                  </button>
                </div>

                {paymentStatus !== 'pending' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      >
                        <option value="Cash">Cash at SS Desk</option>
                        <option value="Mobile Money">Mobile Money (Airtel/MTN)</option>
                        <option value="Bank Transfer">Direct Bank Transfer</option>
                        <option value="SS Envelope">Sabbath School Offering Envelope</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Amount Paid (ZMW)</label>
                      <input
                        type="number"
                        min="0"
                        max={quantity * unitPrice}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Fulfillment Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fulfillment Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="placed">Placed Requisition (Pending ABC delivery)</option>
                  <option value="received_from_abc">Received from ABC (Ready for Pickup)</option>
                  <option value="distributed">Distributed to Member (Already Handed Over)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Superintendent Order Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Requesting large print for senior grandparent; paid via Airtel..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTakeOrderModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  Save Member Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EXISTING MEMBER ORDER */}
      {orderToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Edit Order {orderToEdit.orderNumber}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Manage Member Order</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update quantities, payment status, or distribution tracking.
                </p>
              </div>
              <button
                onClick={() => setOrderToEdit(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditOrder} className="space-y-4">
              {/* Member Name and Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Member Name</label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={memberContact}
                    onChange={(e) => setMemberContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Guide Edition & Quarter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Study Guide Edition</label>
                  <select
                    value={guideType}
                    onChange={(e) => handleGuideTypeChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {Object.keys(STUDY_GUIDE_PRICES).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quarter</label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {availableQuarters.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity, Unit Price & Total */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Unit Price (ZMW)</label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Total Due</label>
                  <div className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 text-center">
                    {formatCurrency(quantity * unitPrice)}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => {
                      const ps = e.target.value as any;
                      setPaymentStatus(ps);
                      if (ps === 'paid') setAmountPaid(quantity * unitPrice);
                      if (ps === 'pending') setAmountPaid(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="paid">Fully Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Amount Collected (ZMW)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Fulfillment Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Distribution Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="placed">Placed Requisition (Pending ABC)</option>
                  <option value="received_from_abc">Received from ABC (In SS Office)</option>
                  <option value="distributed">Distributed to Member</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOrderToEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-950 hover:bg-black text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ABC CONSOLIDATED REQUISITION SHEET */}
      {isAbcRequisitionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Adventist Book Center (ABC) Procurement Requisition
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Consolidated Member Study Guide Order</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Official bulk study guide requisition slip ready for Conference & ABC transmission.
                </p>
              </div>
              <button
                onClick={() => setIsAbcRequisitionModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Quarter Selector */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Requisition Quarter:</span>
                <select
                  value={requisitionQuarter}
                  onChange={(e) => setRequisitionQuarter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800"
                >
                  {availableQuarters.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Table of Requisitions */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                      <th className="py-2.5 px-4">Edition / Guide Type</th>
                      <th className="py-2.5 px-4 text-center">Unit Price (ZMW)</th>
                      <th className="py-2.5 px-4 text-center">Member Copies Ordered</th>
                      <th className="py-2.5 px-4 text-right">Total ZMW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(abcRequisitionData).map(([guide, data]) => (
                      <tr key={guide} className={data.count > 0 ? 'bg-emerald-50/30 font-bold' : 'text-slate-400'}>
                        <td className="py-2.5 px-4 text-slate-900">{guide}</td>
                        <td className="py-2.5 px-4 text-center">{STUDY_GUIDE_PRICES[guide] || 35}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-black ${
                            data.count > 0 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'
                          }`}>
                            {data.count}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          {formatCurrency(data.totalZMW)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-black">
                      <td className="py-3 px-4 uppercase text-[10px] tracking-wider">Total Requisition</td>
                      <td className="py-3 px-4 text-center">-</td>
                      <td className="py-3 px-4 text-center text-amber-400">
                        {Object.values(abcRequisitionData).reduce((sum, d) => sum + d.count, 0)} Copies
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400">
                        {formatCurrency(Object.values(abcRequisitionData).reduce((sum, d) => sum + d.totalZMW, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Superintendent & Treasury Signoff Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Authorized Requisitioner:</span>
                  <strong className="text-slate-900">{superintendentName} (Sabbath School Superintendent)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Requisition Date:</span>
                  <strong className="text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Destination:</span>
                  <strong className="text-slate-900">Woodlands SDA Church • Sabbath School Office</strong>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-950 hover:bg-black text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  Print ABC Requisition Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MEMBER ORDER RECEIPT / SLIP */}
      {orderForReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="text-center pb-4 border-b border-dashed border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Seventh-day Adventist Church
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">Sabbath School Bible Study Guide</h3>
              <p className="text-xs text-slate-500 font-bold">Official Member Order Slip • {orderForReceipt.orderNumber}</p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Member:</span>
                <strong className="text-slate-900">{orderForReceipt.memberName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="text-slate-700">{orderForReceipt.memberContact || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guide Edition:</span>
                <strong className="text-slate-900">{orderForReceipt.guideType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quarter:</span>
                <span className="text-slate-700">{orderForReceipt.quarter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity Ordered:</span>
                <strong className="text-slate-900">{orderForReceipt.quantity} copy (ies)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Price:</span>
                <span className="text-slate-700">{formatCurrency(orderForReceipt.unitPrice)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black">
                <span className="text-slate-900">Total Due:</span>
                <span className="text-emerald-800">{formatCurrency(orderForReceipt.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Amount Paid:</span>
                <strong className="text-slate-900">{formatCurrency(orderForReceipt.amountPaid)} ({orderForReceipt.paymentStatus})</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Distribution Status:</span>
                <strong className="text-blue-900 uppercase text-[10px]">{orderForReceipt.orderStatus.replace('_', ' ')}</strong>
              </div>
              {orderForReceipt.notes && (
                <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 italic">
                  Note: {orderForReceipt.notes}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Issued by: {orderForReceipt.takenBySuperintendent}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderForReceipt(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:text-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE CONFIRMATION */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Member Order?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove order <strong>{orderToDelete.orderNumber}</strong> for <strong>{orderToDelete.memberName}</strong>?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
