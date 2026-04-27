'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { billsAPI, entitiesAPI } from '../../lib/api';
import { INDIAN_STATES } from '../../lib/constants';
import { X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export function RaiseBillModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [entities, setEntities] = useState([]);
  const qc = useQueryClient();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { fundSplit: [{ entityNicId: '', amountCrore: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'fundSplit' });

  const total = parseFloat(watch('totalAmountCrore')) || 0;
  const splits = watch('fundSplit') || [];
  const splitTotal = splits.reduce((s, f) => s + (parseFloat(f.amountCrore) || 0), 0);
  const splitMatch = total > 0 && Math.abs(splitTotal - total) < 0.01;

  useEffect(() => {
    entitiesAPI.getAll().then(r => setEntities(r.data.entities || [])).catch(() => {});
  }, []);

  async function onSubmit(data) {
    if (!splitMatch) return setError('Fund split total must equal requested amount');
    setError(''); setLoading(true);
    try {
      await billsAPI.create(data);
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['bills-recent'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bill.');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Raise New Bill / Fund Request</h2>
            <p className="text-xs text-gray-500 mt-0.5">All amounts in ₹ Crore (Indian Rupees)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Bill Submitted Successfully</h3>
            <p className="text-sm text-gray-500">AI anomaly scan running. Assigned to Level 1 review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">State Government *</label>
                <select {...register('stateCode', { required: 'State is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
                  <option value="">Select State</option>
                  {Object.entries(INDIAN_STATES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                {errors.stateCode && <p className="text-red-500 text-xs mt-1">{errors.stateCode.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Department *</label>
                <input {...register('department', { required: 'Department required' })}
                  placeholder="e.g. Dept. of Roads & Transport"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Project Title *</label>
              <input {...register('projectTitle', { required: 'Title required', minLength: { value: 5, message: 'Min 5 chars' } })}
                placeholder="e.g. NH-48 Widening Phase 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
              {errors.projectTitle && <p className="text-red-500 text-xs mt-1">{errors.projectTitle.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Project Description *</label>
              <textarea {...register('projectDescription', { required: 'Description required', minLength: { value: 20, message: 'Min 20 chars' } })}
                rows={3} placeholder="Describe scope, objectives, beneficiaries..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] resize-none" />
              {errors.projectDescription && <p className="text-red-500 text-xs mt-1">{errors.projectDescription.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Category *</label>
                <select {...register('projectCategory', { required: 'Required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]">
                  <option value="">Select</option>
                  <option value="ROADS_TRANSPORT">Roads & Transport</option>
                  <option value="WATER_RESOURCES">Water Resources</option>
                  <option value="HEALTH">Health</option>
                  <option value="EDUCATION">Education</option>
                  <option value="URBAN_DEV">Urban Development</option>
                  <option value="AGRICULTURE">Agriculture</option>
                  <option value="ENERGY">Energy</option>
                  <option value="MISC">Miscellaneous</option>
                </select>
                {errors.projectCategory && <p className="text-red-500 text-xs mt-1">{errors.projectCategory.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Amount (₹ Crore) *</label>
                <input {...register('totalAmountCrore', { required: 'Required', min: { value: 0.01, message: 'Must be positive' } })}
                  type="number" step="0.01" placeholder="e.g. 5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                {errors.totalAmountCrore && <p className="text-red-500 text-xs mt-1">{errors.totalAmountCrore.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Completion Date *</label>
                <input {...register('expectedCompletionDate', { required: 'Required' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
                {errors.expectedCompletionDate && <p className="text-red-500 text-xs mt-1">{errors.expectedCompletionDate.message}</p>}
              </div>
            </div>

            {/* Fund Split */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">💰 Mandatory Fund Split</h3>
                  <p className="text-xs text-gray-500 mt-0.5">All entities must be pre-registered with verified GST/PAN</p>
                </div>
                <button type="button" onClick={() => append({ entityNicId: '', amountCrore: '' })}
                  className="flex items-center gap-1.5 text-xs bg-white border border-gray-300 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50">
                  <Plus size={13} /> Add Row
                </button>
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <select {...register(`fundSplit.${idx}.entityNicId`, { required: true })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0A2540]">
                        <option value="">Select registered entity...</option>
                        {entities.map(e => (
                          <option key={e._id} value={e.nicEntityId}>[{e.type}] {e.name} — {e.nicEntityId}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input {...register(`fundSplit.${idx}.amountCrore`, { required: true })}
                        type="number" step="0.01" placeholder="₹ Crore"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2540]" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${splitMatch ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {splitMatch ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                Split total: ₹{splitTotal.toFixed(2)} Cr / ₹{total || 0} Cr requested
                {' — '}{splitMatch ? '✓ Amounts match' : 'Does not match total'}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              🔒 This bill requires <strong>OTP dual-signature</strong> from State CM/Finance Minister and Central MoF before sanction. All payments are auto-routed and blockchain-logged.
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading || !splitMatch}
                className="flex-1 bg-[#0A2540] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D3063] disabled:opacity-60">
                {loading ? 'Submitting...' : 'Submit Bill for Review →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
