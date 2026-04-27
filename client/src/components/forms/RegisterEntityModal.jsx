'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { entitiesAPI } from '../../lib/api';
import { INDIAN_STATES } from '../../lib/constants';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function RegisterEntityModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const qc = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const entityType = watch('type');

  async function onSubmit(data) {
    setError(''); setLoading(true);
    try {
      const res = await entitiesAPI.create(data);
      setSuccess(res.data.entity);
      qc.invalidateQueries({ queryKey: ['entities'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check all details.');
    } finally { setLoading(false); }
  }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Register New Entity</h2>
            <p className="text-xs text-gray-500 mt-0.5">GST and PAN will be validated live via SurePass API</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Entity Registered Successfully</h3>
            <div className="bg-gray-50 rounded-lg p-3 mt-3 text-left text-sm">
              <div className="font-medium text-gray-800 mb-1">NIC Entity ID Assigned:</div>
              <div className="font-mono text-[#0A2540] font-bold text-base">{success.nicEntityId}</div>
              <div className="text-xs text-gray-500 mt-2">This ID must be used when referencing this entity in fund splits.</div>
            </div>
            <button onClick={onClose} className="mt-4 bg-[#0A2540] text-white px-5 py-2 rounded-lg text-sm font-medium">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Type + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Entity Type *</label>
                <select {...register('type', { required: 'Type required' })} className={inputCls}>
                  <option value="">Select type</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="MEDIATOR">Mediator</option>
                  <option value="STATE_DEPT">State Department</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Legal Name *</label>
                <input {...register('name', { required: 'Name required' })} placeholder="Full registered legal name" className={inputCls} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>

            {/* GST + PAN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  GST Number {['CONTRACTOR','SUPPLIER'].includes(entityType) ? '*' : '(optional)'}
                </label>
                <input {...register('gstNumber', {
                  ...((['CONTRACTOR','SUPPLIER'].includes(entityType)) && { required: 'GST required for contractors/suppliers' }),
                  pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' },
                })} placeholder="e.g. 29AABCL4532D1Z5" className={`${inputCls} uppercase`} />
                {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Will be validated live against GST database</p>
              </div>
              <div>
                <label className={labelCls}>PAN Number *</label>
                <input {...register('panNumber', {
                  required: 'PAN required',
                  pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' },
                })} placeholder="e.g. AABCL4532D" className={`${inputCls} uppercase`} />
                {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Will be validated live against Income Tax database</p>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">🏦 Bank Account Details (AES-256 Encrypted)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Account Number *</label>
                  <input {...register('bankAccountNumber', { required: 'Account number required', minLength: { value: 9, message: 'Min 9 digits' } })}
                    type="text" placeholder="Bank account number" className={inputCls} />
                  {errors.bankAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>IFSC Code *</label>
                  <input {...register('bankIfsc', {
                    required: 'IFSC required',
                    pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC' },
                  })} placeholder="e.g. SBIN0001234" className={`${inputCls} uppercase`} />
                  {errors.bankIfsc && <p className="text-red-500 text-xs mt-1">{errors.bankIfsc.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Bank Name *</label>
                  <input {...register('bankName', { required: 'Bank name required' })} placeholder="e.g. State Bank of India" className={inputCls} />
                  {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Branch Name *</label>
                  <input {...register('bankBranch', { required: 'Branch required' })} placeholder="e.g. Connaught Place, New Delhi" className={inputCls} />
                  {errors.bankBranch && <p className="text-red-500 text-xs mt-1">{errors.bankBranch.message}</p>}
                </div>
              </div>
            </div>

            {/* Contact + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>State *</label>
                <select {...register('stateCode', { required: 'State required' })} className={inputCls}>
                  <option value="">Select State</option>
                  {Object.entries(INDIAN_STATES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                {errors.stateCode && <p className="text-red-500 text-xs mt-1">{errors.stateCode.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Contact Phone *</label>
                <input {...register('contactPhone', {
                  required: 'Phone required',
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian mobile number' },
                })} placeholder="10-digit mobile number" className={inputCls} />
                {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Contact Email *</label>
                <input {...register('contactEmail', {
                  required: 'Email required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })} type="email" placeholder="official@company.com" className={inputCls} />
                {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Registered Address *</label>
                <input {...register('address', { required: 'Address required' })} placeholder="Full registered office address" className={inputCls} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              🔒 Bank account numbers are stored AES-256 encrypted. GST and PAN are validated in real-time via SurePass API before registration is allowed.
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#0A2540] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D3063] disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader size={14} className="animate-spin" /> Validating GST/PAN...</> : 'Register Entity →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
