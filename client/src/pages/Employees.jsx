import { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button, Input } from '../components/ui';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Employees = () => {
    const { success, error: toastError } = useToast();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '' });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setEmployees(res.data.data || []);
        } catch (err) {
            toastError('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/admin/users', { ...form, password: 'password123' });
            success('Employee added successfully (Default password: password123)');
            setForm({ name: '', email: '' });
            fetchEmployees();
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to add employee');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Are you sure you want to remove this employee?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            success('Employee removed successfully');
            fetchEmployees();
        } catch (err) {
            toastError('Failed to remove employee');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employees</h1>
                <p className="text-slate-500 mt-1">Manage users in your organization</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 border-0 shadow-md h-fit">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Add Employee
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Jane Doe"
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="jane@company.com"
                                required
                            />
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800">New employees will use the default password <strong>password123</strong> to log in initially.</p>
                            </div>
                            <Button type="submit" className="w-full" disabled={actionLoading || !form.name || !form.email}>
                                {actionLoading ? 'Adding...' : 'Add Employee'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-0 shadow-md">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-500" />
                            Directory
                        </CardTitle>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                            {employees.length} users
                        </span>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400">Loading...</div>
                        ) : employees.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No employees found.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {employees.map(emp => (
                                    <div key={emp._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{emp.name}</p>
                                                <p className="text-sm text-slate-500">{emp.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleRemove(emp._id)}
                                            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 border-danger-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Employees;
