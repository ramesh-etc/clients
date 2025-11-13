import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { components } from 'react-select';
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const availableScreens = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/bundlePage', label: 'Bundle Solutions' },
    { path: '/enquiry', label: 'Enquiry' },
    { path: '/project', label: 'Project Details' },
    { path: '/invoice', label: 'Invoice Details' },
    { path: '/LogDetails', label: 'Logs' },
    { path: '/screening', label: 'Screen Settings' },
    { path: '/profile', label: 'Profile' },
    { path: '/projectview', label: 'Project view' },
    { path: '/projectslogs', label: 'Project Log' },
    {path:'/dashboards',label:'Dashboarddetails'},
    {path:'/users',label:'User Management'  },
    {path:"/userproject",label:"User Projects Status"}
];

const screenComponents = {
    '/dashboard': ['Cards', 'Charts', 'Project Table'],
    '/project': ['Project List'],
    '/invoice': ['InvoiceDetails'],
    '/bundlePage': ['BundlePagex'],
    '/projectview': [
        'Project Details', 'Consumption Time', 'POA', 'Meeting Details',
        'Deviation List', 'Project Delayed Reminders', 'Input Sheet', 'milestone'
    ],
    '/enquiry': ['Enquiry'],
    '/profile': ['Profile'],
    '/LogDetails': ['LogDetails'],
    '/screening': ['ScreenSettings'],
    '/projectslogs':['Project Log'],
    '/dashboards':['Project Table','Charts','Cards'],
    '/users':['User Management'],
    '/userproject':["User Project Status"]
};

const LOCAL_STORAGE_KEY = 'user_roles';


const ScreenComponent = () => {
    const [loading, setLoading] = useState(true);
    const [selectedScreens, setSelectedScreens] = useState([]);
    const [selectedComponents, setSelectedComponents] = useState({});
    const [selectedRole, setSelectedRole] = useState('');
    const [permissions, setPermissions] = useState({});
    const [showpopup, setShowpopup] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newsignup, setNewsignup] = useState(false);
    const [roles, setRoles] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const [userrowid, setUserrowid] = useState();
    const [showDelete, setShowdelete] = useState(false);
    const [newroleID, setNewroleID] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        selectedRole: ""
    });
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(true);

    const nameRegex = /^[a-zA-Z \-_']+$/;
    const nameRegex1 = /^[a-zA-Z][a-zA-Z \-_]*$/;
    const [displayText, setDisplayText] = useState("");
    const rolepremission = useSelector((state) => state.userpermission)
    // console.log("showuserpermission", rolepremission);
    const hasPermission = (moduleName, componentName) => {
        const permissions = rolepremission?.permissiondata?.data || [];

        for (const role of permissions) {
            for (const module of role.modules) {
                if (module.module === moduleName) {
                    for (const component of module.components) {
                        const permissionArray = component.permissions.flatMap(p =>
                            p.split(',').map(str => str.trim())
                        );

                        if (component.name === componentName && permissionArray.includes("View")) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    };







    const fetchUserDetails = async () => {
        try {
            const res = await fetch('/server/usermanagement/alluser-permission');
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();

            if (Array.isArray(data.data)) {
                setUserDetails(data.data);
                setRoles(data.data.map((r) => ({ roleId: r.roleId, roleName: r.roleName })));
                setUserrowid(data.modules?.[components.ROWID]);
            }
        } catch (err) {
            console.error('Failed to fetch user details:', err);
        }
    };


    useEffect(() => {
        fetchUserDetails();
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
        setForm((form) => ({
            ...form,
            selectedRole: roleId,
        }));


        const userRoleData = userDetails.find((entry) => entry.roleId === roleId);

        if (userRoleData) {
            const screens = userRoleData.modules.map((mod) =>
                availableScreens.find((s) => s.label === mod.module)?.path
            );

            const components = {};
            const perms = {};
            let extractedRowId;

            userRoleData.modules.forEach((mod) => {
                const screenPath = availableScreens.find((s) => s.label === mod.module)?.path;

                if (screenPath && mod.components) {
                    components[screenPath] = mod.components.map((c) => c.name);

                    mod.components.forEach((c) => {

                        if (!extractedRowId && c.ROWID) {
                            extractedRowId = c.ROWID;
                        }

                        const rawPerms = c.permissions || [];
                        const flatPerms = rawPerms.flatMap((p) =>
                            typeof p === 'string' ? p.split(',').map(x => x.trim()) : []
                        );
                        perms[c.name] = flatPerms;
                    });
                }
            });

            setSelectedScreens(screens.filter(Boolean));
            setSelectedComponents(components);
            setPermissions(perms);
            setUserrowid(extractedRowId);

            console.log("exteraROwid", extractedRowId);

        } else {
            setSelectedScreens([]);
            setSelectedComponents({});
            setPermissions({});
            setUserrowid(undefined);
        }
    };


    const handleScreenToggle = (path) => {
        const isSelected = selectedScreens.includes(path);
        const updatedScreens = isSelected
            ? selectedScreens.filter((item) => item !== path)
            : [...selectedScreens, path];
        setSelectedScreens(updatedScreens);

        if (!isSelected && screenComponents[path]) {
            setSelectedComponents((prev) => ({
                ...prev,
                [path]: screenComponents[path],
            }));
        } else if (isSelected) {
            const updatedComponents = { ...selectedComponents };
            delete updatedComponents[path];
            setSelectedComponents(updatedComponents);
        }
    };

    const handleComponentToggle = (screenPath, componentName) => {
        setSelectedComponents((prev) => {
            const current = prev[screenPath] || [];
            const updated = current.includes(componentName)
                ? current.filter((c) => c !== componentName)
                : [...current, componentName];
            return { ...prev, [screenPath]: updated };
        });

        if (
            selectedComponents[screenPath]?.includes(componentName) &&
            permissions[componentName]
        ) {
            const updatedPerms = { ...permissions };
            delete updatedPerms[componentName];
            setPermissions(updatedPerms);
        }
    };

    const handlePermissionToggle = (componentName, permissionType) => {
        setPermissions((prev) => {
            const current = prev[componentName] || [];
            const exists = current.includes(permissionType);
            const updated = exists
                ? current.filter((p) => p !== permissionType)
                : [...current, permissionType];

            return {
                ...prev,
                [componentName]: updated,
            };
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const structuredModules = selectedScreens.map((path) => ({
            module: availableScreens.find((s) => s.path === path)?.label,
            components: (selectedComponents[path] || []).map((comp) => ({
                ROWID: userrowid,
                name: comp,
                permissions: permissions[comp] || [],
            })),
        }));

        const selectedRoleData = roles.find((r) => r.roleId === selectedRole);
        const roleName = selectedRoleData?.roleName || '';

        const payload = {
            roleId: selectedRole,
            roleName,
            modules: structuredModules,
        };

        const isNewRole = !userDetails.find((entry) => entry.roleId === selectedRole);
        const endpoint = isNewRole
            ? '/server/usermanagement/userpermission'
            : '/server/usermanagement/update/alluserpermission';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log('Permission response:', result);

            setMessageContent(`Permissions ${isNewRole ? 'created' : 'updated'} successfully!`);
            setShowMessage(true);

            await fetchUserDetails();
        } catch (error) {
            console.error('Error saving permissions:', error);

            setMessageContent(`Failed to ${isNewRole ? 'create' : 'update'} permissions.`);
            setShowMessage(true);
        }
    };




    const handleNewRoleSubmit = (e) => {
        e.preventDefault();
        const role = newRoleName.trim();
        if (!role) return;

        const newRoleId = newroleID;
        const newRole = { roleId: newRoleId, roleName: role };

        setRoles((prev) => [...prev, newRole]);
        setSelectedRole(newRoleId);
        setNewRoleName('');
        setNewroleID('');
        setShowpopup(false);
    };


    const handleDelete = async (e) => {
        e.preventDefault();

        const selectedRoleData = roles.find((r) => r.roleId === selectedRole);
        if (!selectedRoleData) {
            alert('No role selected for deletion.');
            return;
        }

        const payload = {
            roleId: selectedRoleData.roleId,
        };

        try {
            const response = await fetch('/server/usermanagement/delete/alluserpermission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Permission delete response:', result);

            // Remove role from state
            setRoles((prevRoles) => prevRoles.filter((r) => r.roleId !== selectedRole));
            setSelectedRole('');
            setSelectedScreens([]);
            setSelectedComponents({});
            setPermissions({});
            setUserrowid(undefined);
            setShowdelete(false);

            setMessageContent("Role deleted successfully!");
            setShowMessage(true);

        } catch (error) {
            console.error('Error deleting role:', error);
            setMessageContent("Failed to delete role.");
            setShowMessage(true);

        }
    };

    const handlesignup = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!form.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (!/^[a-zA-Z\s'-]+$/.test(form.firstName)) {
            newErrors.firstName = "Only letters are allowed";
        }

        if (!form.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (!/^[a-zA-Z\s'-]+$/.test(form.lastName)) {
            newErrors.lastName = "Only letters are allowed";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!selectedRole) {
            newErrors.role = "Role is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const selectedRoleObj = roles.find((r) => r.roleId === selectedRole);

        const userData = {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            roleId: selectedRole,
            roleName: selectedRoleObj?.roleName || '',
        };

        try {
            const response = await fetch("/server/usermanagement/userrole", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error("Failed to create user");
            }

            const result = await response.json();
            console.log("User created:", result);

            toast.success("User created successfully!");

            // Reset form
            setForm({ firstName: '', lastName: '', email: '' });
            setSelectedRole('');
            setErrors({});
            setNewsignup(false);
        } catch (err) {
            console.error("Signup error:", err);
            setError("Failed to create user. Please try again.");
            toast.error("Signup failed. Please try again.");
        }

    };






    return (
        <>
            {/* ...Breadcrumb and Loader... */}

            <form onSubmit={handleSubmit} className="px-6 pb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Access</h2>
                    <div className="flex gap-2">
                        {["New Role", "Delete", "Add User"].map((label, i) => (
                            <motion.button
                                key={label}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                className={`${i === 0
                                    ? "bg-gradient-to-r from-green-500 via-cyan-600 to-blue-700"
                                    : i === 1
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-blue-500 hover:bg-blue-600"
                                    } text-white rounded-lg px-4 py-2 shadow-md`}
                                onClick={() => {
                                    if (i === 0) {
                                        setShowpopup(true);
                                    } else if (i === 1) {
                                        setShowdelete(true);
                                    } else {
                                        setNewsignup(true);
                                    }
                                }}
                            >
                                {label}
                            </motion.button>
                        ))}

                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT SIDE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full lg:w-1/3 bg-white border rounded-xl shadow-lg p-4"
                    >
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Select User Role</label>
                            <select
                                value={selectedRole}
                                onChange={handleRoleChange}
                                className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm
               focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200
               hover:bg-green-50"
                                required
                            >
                                <option value="">Select Role</option>
                                {roles.map((r) => (
                                    <option key={r.roleId} value={r.roleId} className="text-gray-800">
                                        {r.roleName}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <AnimatePresence>
                            {selectedRole && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <label className="block mb-2 font-semibold text-gray-700">Allowed Modules</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availableScreens.map((screen) => (
                                            <motion.div
                                                key={screen.path}
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedScreens.includes(screen.path)}
                                                    onChange={() => handleScreenToggle(screen.path)}
                                                    className="w-4 h-4 accent-green-600"
                                                />

                                                <label className="text-sm">{screen.label}</label>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* RIGHT SIDE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="w-full lg:w-2/3 border-2 border-dashed rounded-xl p-4 bg-white shadow-lg"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Components by Module</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {selectedScreens.length === 0 ? (
                                <div className="col-span-full text-center text-gray-500 py-8">
                                    Select a module to view and assign components.
                                </div>
                            ) : (
                                selectedScreens.map((screenPath) =>
                                    screenComponents[screenPath] && (
                                        <motion.div
                                            key={screenPath}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-4 border rounded-lg bg-gray-50"
                                        >
                                            <h4 className="font-semibold mb-2 text-sm text-gray-700">
                                                {availableScreens.find((s) => s.path === screenPath)?.label}
                                            </h4>
                                            {screenComponents[screenPath].map((comp) => (
                                                <div key={comp} className="mb-4">
                                                    <div className="flex items-center bg-white border rounded-md px-3 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedComponents[screenPath]?.includes(comp) || false}
                                                            onChange={() => handleComponentToggle(screenPath, comp)}
                                                            className="w-4 h-4 accent-green-600"
                                                        />
                                                        <label className="ml-2 text-sm">{comp}</label>
                                                    </div>

                                                    <AnimatePresence>
                                                        {selectedComponents[screenPath]?.includes(comp) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex justify-end mt-2 gap-2 flex-wrap"
                                                            >
                                                                {["Create", "View", "Edit", "Delete",].map((perm) => (
                                                                    <label
                                                                        key={perm}
                                                                        className="flex items-center gap-1 text-xs text-gray-600"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={permissions[comp]?.includes(perm) || false}
                                                                            onChange={() => handlePermissionToggle(comp, perm)}
                                                                            className="w-4 h-4 accent-green-600"
                                                                        />
                                                                        <span>{perm}</span>
                                                                    </label>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )
                                )
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className="flex justify-center mt-8">
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-40 py-2 bg-gradient-to-r from-green-500 via-cyan-600 to-blue-700 text-white rounded-lg shadow-md"
                    >
                        Save Access
                    </motion.button>

                    {showMessage && (
                        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">

                            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
                                <p className="text-gray-800 font-semibold">{messageContent}</p>
                                <button
                                    onClick={() => setShowMessage(false)}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </form>

            {/* Popup for new role */}
            {showpopup && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Create New Role</h2>
                            <button
                                onClick={() => setShowpopup(false)}
                                className="text-red-500 font-bold text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleNewRoleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">RoleID</label>
                                <input
                                    type="text"
                                    value={newroleID}
                                    onChange={(e) => setNewroleID(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Role
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {showDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Delete Role</h2>
                            <button
                                onClick={() => setShowdelete(false)}
                                className="text-red-500 font-bold text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleDelete} className="space-y-4">
                            <select
                                value={selectedRole}
                                onChange={handleRoleChange}
                                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm 
               focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 
               hover:bg-green-50"
                                required
                            >
                                <option value="">Select Role</option>
                                {roles.map((r) => (
                                    <option key={r.roleId} value={r.roleId} className="text-gray-800">
                                        {r.roleName}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="w-full py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg 
               shadow-md hover:opacity-90"
                            >
                                Delete Role
                            </button>
                        </form>

                    </div>
                </div>
            )}

            {newsignup && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                    <div className='bg-white p-6 rounded-md shadow-md w-full max-w-md'>
                        <form onSubmit={handlesignup} className="modal-content">
                            <div className='flex justify-between '>
                                <h3>Add User</h3>
                                <button
                                    onClick={() => setNewsignup(false)}
                                    className="text-red-500 font-bold text-xl cursor-pointer"
                                >
                                    &times;
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[a-zA-Z\s'-]*$/.test(value)) {
                                            setForm({ ...form, firstName: value });
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[a-zA-Z\s'-]*$/.test(value)) {
                                            setForm({ ...form, lastName: value });
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="text"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={handleRoleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((r) => (
                                        <option key={r.roleId} value={r.roleId}>
                                            {r.roleName}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                            </div>

                            {error && (
                                <p className="error-message">{error}</p>
                            )}
                            <center>
                                <input type="submit" value="ADD" className="signupfnbtn" />
                            </center>
                        </form>

                    </div>


                </div>

            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </>

    );
};

export default ScreenComponent;