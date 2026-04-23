import { useEffect, useState } from 'react';
import { Building2, Users, CalendarCheck, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button, Input, Modal } from '../components/ui';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const SuperAdminDashboard = () => {
    const { success, error: toastError } = useToast();
    const [metrics, setMetrics] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form, setForm] = useState({ orgName: '', adminName: '', adminEmail: '', password: 'password123' });

    const fetchData = async () => {
        try {
            const [metricsRes, orgsRes] = await Promise.all([
                api.get('/super-admin/metrics'),
                api.get('/super-admin/organizations')
            ]);
            setMetrics(metricsRes.data.data);
            setOrganizations(orgsRes.data.data);
        } catch (err) {
            toastError('Failed to fetch platform data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await api.post('/super-admin/organizations', form);
            success('Organization and Admin created successfully!');
            setIsModalOpen(false);
            setForm({ orgName: '', adminName: '', adminEmail: '', password: 'password123' });
            fetchData();
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to create organization');
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading platform data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage tenants and view platform-wide metrics</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Organization
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Organizations</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{metrics?.totalOrganizations || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-violet-500">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{metrics?.totalUsers || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{metrics?.totalBookings || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Organizations List */}
            <Card className="border-0 shadow-md">
                <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Registered Organizations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Organization Name</th>
                                    <th className="px-6 py-4">Users</th>
                                    <th className="px-6 py-4">Total Bookings</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {organizations.map(org => (
                                    <tr key={org._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {org.name}
                                        </td>
                                        <td className="px-6 py-4">{org.usersCount}</td>
                                        <td className="px-6 py-4">{org.bookingsCount}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {organizations.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No organizations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Organization">
                <form onSubmit={handleCreateOrg} className="space-y-4">
                    <Input
                        label="Organization Name"
                        value={form.orgName}
                        onChange={e => setForm(p => ({ ...p, orgName: e.target.value }))}
                        required
                    />
                    <div className="border-t border-slate-100 pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Admin Account Details</h3>
                        <div className="space-y-4">
                            <Input
                                label="Admin Name"
                                value={form.adminName}
                                onChange={e => setForm(p => ({ ...p, adminName: e.target.value }))}
                                required
                            />
                            <Input
                                label="Admin Email"
                                type="email"
                                value={form.adminEmail}
                                onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createLoading} className="flex-1">
                            {createLoading ? 'Creating...' : 'Create Org & Admin'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SuperAdminDashboard;
