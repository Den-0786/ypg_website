import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Download,
  Search,
  BarChart3,
  PieChart,
  Target,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Heart,
  BookOpen,
  Home,
  GraduationCap,
  Gift,
  Building,
  ShoppingCart,
  FileText,
  BarChart,
  PieChart as PieChartIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Congregations list
const congregations = [
  "Emmanuel Congregation Ahinsan",
  "Peniel Congregation Esreso No1",
  "Mizpah Congregation Odagya No1",
  "Christ Congregation Ahinsan Estate",
  "Ebenezer Congregation Dompoase Aprabo",
  "Favour Congregation Esreso No2",
  "Liberty Congregation Esreso High Tension",
  "Odagya No2",
  "NOM",
  "Kokobriko",
];

const DonationsManagement = ({ donations = [], setDonations, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenewalsModal, setShowRenewalsModal] = useState(false);
  const [showOffertoryModal, setShowOffertoryModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingContribution, setEditingContribution] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedYear, setExpandedYear] = useState(null);
  const [newDonation, setNewDonation] = useState({
    donor_name: "",
    amount: "",
    email: "",
    phone: "",
    message: "",
    payment_method: "momo",
    purpose: "general",
    payment_status: "pending",
  });

  const [renewalsData, setRenewalsData] = useState({
    congregation: "",
    date: "",
    amount: "",
    number_of_people: "",
  });

  const [offertoryData, setOffertoryData] = useState({
    date: "",
    program_type: "",
    venue: "",
    amount: "",
  });

  const [salesData, setSalesData] = useState({
    item_name: "",
    price: "",
    date: "",
    sold_by: "",
  });

  const [expensesData, setExpensesData] = useState({
    date: "",
    description: "",
    amount: "",
    paid_by: "",
  });

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
      return true;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError("");
      return true;
    }
    const cleanPhone = phone.replace(/\s+/g, "");
    if (!cleanPhone.startsWith("0") && !cleanPhone.startsWith("+233")) {
      setPhoneError("Number must start with 0 or +233");
      return false;
    }
    let expectedLength = 10;
    if (cleanPhone.startsWith("+233")) {
      expectedLength = 13;
    }
    if (cleanPhone.length !== expectedLength) {
      setPhoneError("Number must be 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Purpose options
  const purposeOptions = [
    {
      value: "general",
      label: "General Fund",
      icon: Heart,
      color: "bg-red-500",
    },
    {
      value: "events",
      label: "Events & Activities",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      value: "welfare",
      label: "Welfare Committee",
      icon: Gift,
      color: "bg-green-500",
    },
    {
      value: "ministry",
      label: "Ministry Support",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      value: "building",
      label: "Building Fund",
      icon: Home,
      color: "bg-orange-500",
    },
    {
      value: "education",
      label: "Education Fund",
      icon: GraduationCap,
      color: "bg-indigo-500",
    },
  ];

  // Financial data state
  const [contributions, setContributions] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Calculate financial summary
  const calculateFinancialSummary = () => {
    // Total Donations (verified only)
    const totalDonations = donations
      .filter((d) => d.payment_status === "verified")
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    // Total Contributions (Renewals + Offertories)
    const totalContributions = contributions
      .filter((c) => c.status === "verified")
      .reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);

    // Total Sales Revenue
    const totalSales = sales
      .filter((s) => s.status === "completed")
      .reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);

    // Total Expenses
    const totalExpenses = expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    // Calculate Balance
    const totalIncome = totalDonations + totalContributions + totalSales;
    const currentBalance = totalIncome - totalExpenses;

    return {
      totalDonations,
      totalContributions,
      totalSales,
      totalExpenses,
      currentBalance,
      totalIncome
    };
  };

  // Get current year
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  // Group renewals by year and congregation
  const getRenewalsByYear = () => {
    const renewalsByYear = {};
    const currentYear = getCurrentYear();
    
    // Always include current year (2025)
    renewalsByYear[currentYear] = {};
    
    contributions
      .filter(contrib => contrib.type === 'renewal')
      .forEach(renewal => {
        const year = new Date(renewal.date).getFullYear();
        // Skip 2024, only show current year and other years
        if (year === 2024) return;
        
        if (!renewalsByYear[year]) {
          renewalsByYear[year] = {};
        }
        if (!renewalsByYear[year][renewal.congregation]) {
          renewalsByYear[year][renewal.congregation] = {
            congregation: renewal.congregation,
            count: 0,
            totalAmount: 0,
            renewals: []
          };
        }
        renewalsByYear[year][renewal.congregation].count += 1;
        renewalsByYear[year][renewal.congregation].totalAmount += renewal.amount;
        renewalsByYear[year][renewal.congregation].renewals.push(renewal);
      });

    return renewalsByYear;
  };

  // Group offertories by year and program
  const getOffertoriesByYear = () => {
    const offertoriesByYear = {};
    const currentYear = getCurrentYear();
    
    // Always include current year (2025)
    offertoriesByYear[currentYear] = {};
    
    contributions
      .filter(contrib => contrib.type === 'offertory')
      .forEach(offertory => {
        const year = new Date(offertory.date).getFullYear();
        // Skip 2024, only show current year and other years
        if (year === 2024) return;
        
        if (!offertoriesByYear[year]) {
          offertoriesByYear[year] = {};
        }
        if (!offertoriesByYear[year][offertory.program_type]) {
          offertoriesByYear[year][offertory.program_type] = {
            program_type: offertory.program_type,
            venue: offertory.venue,
            count: 0,
            totalAmount: 0,
            offertories: []
          };
        }
        offertoriesByYear[year][offertory.program_type].count += 1;
        offertoriesByYear[year][offertory.program_type].totalAmount += offertory.amount;
        offertoriesByYear[year][offertory.program_type].offertories.push(offertory);
      });

    return offertoriesByYear;
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalAmount = donations.reduce(
      (sum, donation) => sum + parseFloat(donation.amount || 0),
      0
    );
    const verifiedAmount = donations
      .filter((d) => d.payment_status === "verified")
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const pendingCount = donations.filter(
      (d) => d.payment_status === "pending"
    ).length;
    const verifiedCount = donations.filter(
      (d) => d.payment_status === "verified"
    ).length;
    const failedCount = donations.filter(
      (d) => d.payment_status === "failed"
    ).length;

    const momoTotal = donations
      .filter(
        (d) => d.payment_method === "momo" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const cashTotal = donations
      .filter(
        (d) => d.payment_method === "cash" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const bankTotal = donations
      .filter(
        (d) => d.payment_method === "bank" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const cardTotal = donations
      .filter(
        (d) => d.payment_method === "card" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    // Purpose breakdown
    const purposeBreakdown = purposeOptions.map((purpose) => ({
      ...purpose,
      amount: donations
        .filter(
          (d) => d.purpose === purpose.value && d.payment_status === "verified"
        )
        .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0),
      count: donations.filter((d) => d.purpose === purpose.value).length,
    }));

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthAmount = donations
        .filter((d) => {
          const donationDate = new Date(d.created_at);
          return (
            donationDate.getMonth() === date.getMonth() &&
            donationDate.getFullYear() === date.getFullYear() &&
            d.payment_status === "verified"
          );
        })
        .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

      monthlyTrends.push({ month, year, amount: monthAmount });
    }

    return {
      totalAmount,
      verifiedAmount,
      pendingCount,
      verifiedCount,
      failedCount,
      momoTotal,
      cashTotal,
      bankTotal,
      cardTotal,
      purposeBreakdown,
      monthlyTrends,
    };
  };

  const analytics = calculateAnalytics();

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.receipt_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPurpose =
      selectedPurpose === "all" || donation.purpose === selectedPurpose;
    const matchesStatus =
      selectedStatus === "all" || donation.payment_status === selectedStatus;

    const matchesPending =
      !showPendingOnly || donation.payment_status === "pending";

    return matchesSearch && matchesPurpose && matchesStatus && matchesPending;
  });

  const handleAddDonation = async () => {
    const isEmailValid = validateEmail(newDonation.email);
    const isPhoneValid = validatePhone(newDonation.phone);

    if (!isEmailValid || !isPhoneValid) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8002/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDonation),
      });

      if (response.ok) {
        const addedDonation = await response.json();
        setDonations([...donations, addedDonation]);
        setShowAddModal(false);
        setNewDonation({
          donor_name: "",
          amount: "",
          email: "",
          phone: "",
          message: "",
          payment_method: "momo",
          purpose: "general",
          payment_status: "pending",
        });
        setEmailError("");
        setPhoneError("");
        toast.success("Donation added successfully!");
      }
    } catch (error) {
      console.error("Error adding donation:", error);
      toast.error("Failed to add donation. Please try again.");
    }
  };

  const handleAddRenewals = async () => {
    try {
      const url = editingContribution 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contributions/${editingContribution.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contributions/create/`;
      
      const method = editingContribution ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "renewal",
          congregation: renewalsData.congregation,
          amount: parseFloat(renewalsData.amount),
          number_of_people: parseInt(renewalsData.number_of_people),
          date: renewalsData.date,
          status: "completed",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingContribution) {
          setContributions(prev => prev.map(contribution => contribution.id === editingContribution.id ? result.contribution : contribution));
          toast.success("Renewal updated successfully!");
        } else {
          setContributions(prev => [...prev, result.contribution]);
          toast.success("Renewals added successfully!");
        }
        setShowRenewalsModal(false);
        setRenewalsData({
          congregation: "",
          date: "",
          amount: "",
          number_of_people: "",
        });
        setEditingContribution(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${editingContribution ? 'update' : 'add'} renewals. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${editingContribution ? 'updating' : 'adding'} renewals:`, error);
      toast.error(`Failed to ${editingContribution ? 'update' : 'add'} renewals. Please try again.`);
    }
  };

  const handleAddOffertory = async () => {
    try {
      const url = editingContribution 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contributions/${editingContribution.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contributions/create/`;
      
      const method = editingContribution ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "offertory",
          date: offertoryData.date,
          program_type: offertoryData.program_type,
          venue: offertoryData.venue,
          amount: parseFloat(offertoryData.amount),
          status: "completed",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingContribution) {
          setContributions(prev => prev.map(contribution => contribution.id === editingContribution.id ? result.contribution : contribution));
          toast.success("Offertory updated successfully!");
        } else {
          setContributions(prev => [...prev, result.contribution]);
          toast.success("Offertory added successfully!");
        }
        setShowOffertoryModal(false);
        setOffertoryData({
          date: "",
          program_type: "",
          venue: "",
          amount: "",
        });
        setEditingContribution(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${editingContribution ? 'update' : 'add'} offertory. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${editingContribution ? 'updating' : 'adding'} offertory:`, error);
      toast.error(`Failed to ${editingContribution ? 'update' : 'add'} offertory. Please try again.`);
    }
  };

  const handleAddSales = async () => {
    try {
      const url = editingSale 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/sales/${editingSale.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/sales/create/`;
      
      const method = editingSale ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_name: salesData.item_name,
          price: parseFloat(salesData.price),
          date: salesData.date,
          sold_by: salesData.sold_by,
          quantity: 1,
          status: "completed",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingSale) {
          setSales(prev => prev.map(sale => sale.id === editingSale.id ? result.sale : sale));
          toast.success("Sale updated successfully!");
        } else {
          setSales(prev => [...prev, result.sale]);
          toast.success("Sale added successfully!");
        }
        setShowSalesModal(false);
        setSalesData({
          item_name: "",
          price: "",
          date: "",
          sold_by: "",
        });
        setEditingSale(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${editingSale ? 'update' : 'add'} sale. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${editingSale ? 'updating' : 'adding'} sale:`, error);
      toast.error(`Failed to ${editingSale ? 'update' : 'add'} sale. Please try again.`);
    }
  };

  const handleAddExpenses = async () => {
    try {
      const url = editingExpense 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/expenses/${editingExpense.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/expenses/create/`;
      
      const method = editingExpense ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: expensesData.date,
          description: expensesData.description,
          amount: parseFloat(expensesData.amount),
          paid_by: expensesData.paid_by,
          category: "general",
          status: "approved",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingExpense) {
          setExpenses(prev => prev.map(expense => expense.id === editingExpense.id ? result.expense : expense));
          toast.success("Expense updated successfully!");
        } else {
          setExpenses(prev => [...prev, result.expense]);
          toast.success("Expense added successfully!");
        }
        setShowExpensesModal(false);
        setExpensesData({
          date: "",
          description: "",
          amount: "",
          paid_by: "",
        });
        setEditingExpense(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${editingExpense ? 'update' : 'add'} expense. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${editingExpense ? 'updating' : 'adding'} expense:`, error);
      toast.error(`Failed to ${editingExpense ? 'update' : 'add'} expense. Please try again.`);
    }
  };

  // Edit and Delete handlers for Sales
  const handleEditSale = (sale) => {
    setSalesData({
      item_name: sale.item_name,
      price: sale.price.toString(),
      date: sale.date,
      sold_by: sale.sold_by,
    });
    setEditingSale(sale);
    setShowSalesModal(true);
  };

  const handleDeleteSale = async (saleId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/sales/${saleId}/delete/`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setSales(prev => prev.filter(sale => sale.id !== saleId));
        toast.success("Sale deleted successfully!");
      } else {
        toast.error("Failed to delete sale. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale. Please try again.");
    }
  };

  // Edit and Delete handlers for Expenses
  const handleEditExpense = (expense) => {
    setExpensesData({
      date: expense.date,
      description: expense.description,
      amount: expense.amount.toString(),
      paid_by: expense.paid_by,
    });
    setEditingExpense(expense);
    setShowExpensesModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/expenses/${expenseId}/delete/`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
        toast.success("Expense deleted successfully!");
      } else {
        toast.error("Failed to delete expense. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  // Edit and Delete handlers for Contributions
  const handleEditContribution = (contribution) => {
    if (contribution.type === 'renewal') {
      setRenewalsData({
        congregation: contribution.congregation || "",
        date: contribution.date,
        amount: contribution.amount.toString(),
        number_of_people: contribution.number_of_people?.toString() || "",
      });
      setEditingContribution(contribution);
      setShowRenewalsModal(true);
    } else {
      setOffertoryData({
        date: contribution.date,
        program_type: contribution.program_type || "",
        venue: contribution.venue || "",
        amount: contribution.amount.toString(),
      });
      setEditingContribution(contribution);
      setShowOffertoryModal(true);
    }
  };

  const handleDeleteContribution = async (contributionId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contributions/${contributionId}/delete/`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setContributions(prev => prev.filter(contribution => contribution.id !== contributionId));
        toast.success("Contribution deleted successfully!");
      } else {
        toast.error("Failed to delete contribution. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting contribution:", error);
      toast.error("Failed to delete contribution. Please try again.");
    }
  };

  const handleVerifyDonation = async (donation) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/donations/${donation.id}/verify/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(
          donations.map((d) =>
            d.id === donation.id ? { ...d, payment_status: "verified" } : d
          )
        );
        toast.success("Donation verified successfully!");
      }
    } catch (error) {
      console.error("Error verifying donation:", error);
      toast.error("Failed to verify donation. Please try again.");
    }
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        const response = await fetch(
          `http://localhost:8002/api/donations/${id}/delete/`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setDonations(donations.filter((d) => d.id !== id));
          toast.success("Donation deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting donation:", error);
        toast.error("Failed to delete donation. Please try again.");
      }
    }
  };

  const exportDonations = () => {
    const csvContent = [
      [
        "Donor Name",
        "Email",
        "Phone",
        "Amount",
        "Purpose",
        "Payment Method",
        "Status",
        "Date",
        "Receipt Code",
      ],
      ...filteredDonations.map((donation) => [
        donation.donor_name,
        donation.email,
        donation.phone,
        donation.amount,
        donation.purpose,
        donation.payment_method,
        donation.payment_status,
        new Date(donation.created_at).toLocaleDateString(),
        donation.receipt_code,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "momo":
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case "cash":
        return <Banknote className="w-5 h-5 text-yellow-600" />;
      case "bank":
        return <Building className="w-5 h-5 text-blue-600" />;
      case "card":
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Finance Management
          </h2>
          <p className="text-gray-600">
            Manage and track all financial activities of the YPG ministry
          </p>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="flex space-x-3 min-w-max px-4 sm:px-0">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap min-w-[140px]"
            >
              <BarChart3 className="w-5 h-5" />
              <span>{showAnalytics ? "Hide" : "Show"} Analytics</span>
            </button>
            <button
              onClick={exportDonations}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap min-w-[120px]"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap min-w-[140px]"
            >
              <Plus className="w-5 h-5" />
              <span>Add Donation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Finance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Donations Card */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                Total Donations
              </p>
              <p className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} truncate`}>
                ₵{calculateFinancialSummary().totalDonations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Contributions Card */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                Total Contributions
              </p>
              <p className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} truncate`}>
                ₵{calculateFinancialSummary().totalContributions.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 truncate">Renewals + Offertories</p>
            </div>
          </div>
        </div>

        {/* Total Sales Revenue Card */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                Total Sales Revenue
              </p>
              <p className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} truncate`}>
                ₵{calculateFinancialSummary().totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                Total Expenses
              </p>
              <p className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} truncate`}>
                ₵{calculateFinancialSummary().totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6 mb-8`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className={`text-base sm:text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Current Balance
            </p>
            <p className={`text-2xl sm:text-3xl font-bold ${calculateFinancialSummary().currentBalance >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
              ₵{calculateFinancialSummary().currentBalance.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">All Income - Expenses</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
              <span className="text-green-600 truncate">Income: ₵{calculateFinancialSummary().totalIncome.toLocaleString()}</span>
              <span className="text-red-600 truncate">Expenses: ₵{calculateFinancialSummary().totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contributions Section */}
      <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6 mb-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg sm:text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} whitespace-nowrap`}>
              Contributions Management
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} whitespace-nowrap`}>
              Members renewals and offertories
            </p>
          </div>
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowRenewalsModal(true)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap flex-1 sm:flex-none"
            >
              <Plus className="w-3 h-3" />
              Add Renewals
            </button>
            <button
              onClick={() => setShowOffertoryModal(true)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm whitespace-nowrap flex-1 sm:flex-none"
            >
              <Plus className="w-3 h-3" />
              Add Offertory
            </button>
          </div>
        </div>

        {/* Renewals Summary - Collapsible by Year */}
        <div className="space-y-4">
          {Object.keys(getRenewalsByYear()).length === 0 ? (
            <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Renewals Yet</p>
              <p className="text-sm">Add renewals to see yearly summaries by congregation</p>
            </div>
          ) : (
            Object.entries(getRenewalsByYear())
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by year descending
              .map(([year, congregations]) => {
                const totalRenewals = Object.values(congregations).reduce((sum, cong) => sum + cong.count, 0);
                const totalAmount = Object.values(congregations).reduce((sum, cong) => sum + cong.totalAmount, 0);
                const isExpanded = expandedYear === year;

                return (
                  <div key={year} className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}>
                    {/* Year Header - Clickable */}
                    <button
                      onClick={() => setExpandedYear(isExpanded ? null : year)}
                      className="w-full p-4 text-left hover:bg-opacity-80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-blue-600" : "bg-blue-500"}`}>
                            <span className="text-white font-bold text-sm">{year}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} whitespace-nowrap`}>
                              Renewals Summary
                            </h4>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} whitespace-nowrap`}>
                              {totalRenewals} renewals • ₵{totalAmount.toLocaleString()}
                            </p>
                            <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"} whitespace-nowrap`}>
                              {Object.keys(congregations).length} congregations
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`${theme === "dark" ? "border-gray-600" : "border-gray-200"} border-b`}>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Congregation
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Renewals
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Amount
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.values(congregations).map((congregation, index) => (
                                <tr key={index} className={`${theme === "dark" ? "border-gray-600" : "border-gray-200"} border-b`}>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-blue-400" : "bg-blue-500"}`}></div>
                                      {congregation.congregation}
                                    </div>
                                  </td>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${theme === "dark" ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}`}>
                                      {congregation.count} renewals
                                    </span>
                                  </td>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"} font-semibold`}>
                                    ₵{congregation.totalAmount.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>

        {/* Offertories Summary - Collapsible by Year */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Offertories Summary
            </h4>
          </div>
          
          {Object.keys(getOffertoriesByYear()).length === 0 ? (
            <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Offertories Yet</p>
              <p className="text-sm">Add offertories to see yearly summaries by program</p>
            </div>
          ) : (
            Object.entries(getOffertoriesByYear())
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by year descending
              .map(([year, programs]) => {
                const totalOffertories = Object.values(programs).reduce((sum, prog) => sum + prog.count, 0);
                const totalAmount = Object.values(programs).reduce((sum, prog) => sum + prog.totalAmount, 0);
                const isExpanded = expandedYear === `offertory-${year}`;

                return (
                  <div key={year} className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}>
                    {/* Year Header - Clickable */}
                    <button
                      onClick={() => setExpandedYear(isExpanded ? null : `offertory-${year}`)}
                      className="w-full p-4 text-left hover:bg-opacity-80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-green-600" : "bg-green-500"}`}>
                            <span className="text-white font-bold text-sm">{year}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} whitespace-nowrap`}>
                              Offertories Summary
                            </h4>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} whitespace-nowrap`}>
                              {totalOffertories} offertories • ₵{totalAmount.toLocaleString()}
                            </p>
                            <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"} whitespace-nowrap`}>
                              {Object.keys(programs).length} programs
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`${theme === "dark" ? "border-gray-600" : "border-gray-200"} border-b`}>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Program/Event
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Venue
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Date
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Amount
                                </th>
                                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.values(programs).map((program, index) => (
                                <tr key={index} className={`${theme === "dark" ? "border-gray-600" : "border-gray-200"} border-b`}>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-green-400" : "bg-green-500"}`}></div>
                                      <div>
                                        <div className="font-medium">{program.program_type}</div>
                                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                          {program.count} offertory{program.count !== 1 ? 'ies' : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {program.venue}
                                    </div>
                                  </td>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    {program.offertories.length > 0 && new Date(program.offertories[0].date).toLocaleDateString()}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"} font-semibold`}>
                                    ₵{program.totalAmount.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Total Amount Summary */}
                        <div className={`mt-4 p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-green-600" : "bg-green-500"}`}>
                                <Gift className="w-3 h-3 text-white" />
                              </div>
                              <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                Total Offertories for {year}
                              </span>
                            </div>
                            <span className={`text-xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                              ₵{totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Sales Section */}
      <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6 mb-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg sm:text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} whitespace-nowrap`}>
              Sales Management
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} whitespace-nowrap`}>
              Track sales revenue and inventory
            </p>
          </div>
          <button
            onClick={() => setShowSalesModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition w-full sm:w-auto min-w-[140px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Sale
          </button>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full px-4 sm:px-0">
            <table className="w-full min-w-[600px]">
            <thead>
              <tr className={`${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Item
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Quantity
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Unit Price
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Total
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Date
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Status
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className={`${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {sale.item_name}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {sale.quantity}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    ₵{sale.unit_price}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    ₵{sale.total_amount}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditSale(sale)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSale(sale.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border p-4 sm:p-6 mb-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg sm:text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} whitespace-nowrap`}>
              Expenses Management
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} whitespace-nowrap`}>
              Track and categorize expenses
            </p>
          </div>
          <button
            onClick={() => setShowExpensesModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full sm:w-auto min-w-[140px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full px-4 sm:px-0">
            <table className="w-full min-w-[600px]">
            <thead>
              <tr className={`${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Description
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Category
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Amount
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Date
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Status
                </th>
                <th className={`text-left py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className={`${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {expense.description}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      expense.category === 'events' 
                        ? 'bg-blue-100 text-blue-800' 
                        : expense.category === 'equipment'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    ₵{expense.amount}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      expense.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditExpense(expense)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Donation Analytics
            </h3>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Total Verified
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                      ₵{analytics.verifiedAmount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Total Donations
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {donations.length}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">
                      Pending
                    </p>
                    <p className="text-3xl font-bold text-yellow-700">
                      {analytics.pendingCount}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">
                      Verified
                    </p>
                    <p className="text-3xl font-bold text-purple-700">
                      {analytics.verifiedCount}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Methods
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      method: "Mobile Money",
                      amount: analytics.momoTotal,
                      icon: Smartphone,
                      color: "bg-green-500",
                    },
                    {
                      method: "Cash",
                      amount: analytics.cashTotal,
                      icon: Banknote,
                      color: "bg-yellow-500",
                    },
                    {
                      method: "Bank Transfer",
                      amount: analytics.bankTotal,
                      icon: Building,
                      color: "bg-blue-500",
                    },
                    {
                      method: "Card",
                      amount: analytics.cardTotal,
                      icon: CreditCard,
                      color: "bg-purple-500",
                    },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    const percentage =
                      analytics.verifiedAmount > 0
                        ? (item.amount / analytics.verifiedAmount) * 100
                        : 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">
                            {item.method}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₵{item.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Purpose Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Purpose Breakdown
                </h4>
                <div className="space-y-4">
                  {analytics.purposeBreakdown.map((purpose, index) => {
                    const IconComponent = purpose.icon;
                    const percentage =
                      analytics.verifiedAmount > 0
                        ? (purpose.amount / analytics.verifiedAmount) * 100
                        : 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${purpose.color} rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              {purpose.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {purpose.count} donations
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₵{purpose.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Trends (Last 6 Months)
              </h4>
              <div className="flex items-end space-x-4 h-32">
                {analytics.monthlyTrends.map((month, index) => {
                  const maxAmount = Math.max(
                    ...analytics.monthlyTrends.map((m) => m.amount)
                  );
                  const height =
                    maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-gray-200 rounded-t-lg relative"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {month.month}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₵{month.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Purposes</option>
            {purposeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pending Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <motion.tr
                  key={donation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donor_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.email}
                      </div>
                      {donation.phone && (
                        <div className="text-sm text-gray-500">
                          {donation.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ₵{donation.amount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {donation.currency || "GHS"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const purpose = purposeOptions.find(
                          (p) => p.value === donation.purpose
                        );
                        if (purpose) {
                          const IconComponent = purpose.icon;
                          return (
                            <>
                              <div
                                className={`w-6 h-6 ${purpose.color} rounded flex items-center justify-center`}
                              >
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">
                                {purpose.label}
                              </span>
                            </>
                          );
                        }
                        return (
                          <span className="text-sm text-gray-700">
                            {donation.purpose}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(donation.payment_method)}
                      <span className="text-sm text-gray-700 capitalize">
                        {donation.payment_method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(donation.payment_status)}
                      <span className="text-sm text-gray-700 capitalize">
                        {donation.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {donation.payment_status === "pending" && (
                      <button
                        onClick={() => handleVerifyDonation(donation)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Verify Donation"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDonation(donation.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Donation"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No donations found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or add a new donation.
            </p>
          </div>
        )}
      </div>

      {/* Add Donation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Add New Donation
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDonation();
                }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donor Name *
                    </label>
                    <input
                      type="text"
                      value={newDonation.donor_name}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          donor_name: e.target.value,
                        })
                      }
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={newDonation.amount}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          amount: e.target.value,
                        })
                      }
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newDonation.email}
                      onChange={(e) => {
                        setNewDonation({
                          ...newDonation,
                          email: e.target.value,
                        });
                        validateEmail(e.target.value);
                      }}
                      required
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        emailError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newDonation.phone}
                      onChange={(e) => {
                        setNewDonation({
                          ...newDonation,
                          phone: e.target.value,
                        });
                        validatePhone(e.target.value);
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        phoneError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose
                    </label>
                    <select
                      value={newDonation.purpose}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          purpose: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {purposeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={newDonation.payment_method}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="momo">Mobile Money</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Credit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newDonation.message}
                    onChange={(e) =>
                      setNewDonation({
                        ...newDonation,
                        message: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Donation
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Renewals Modal */}
      <AnimatePresence>
        {showRenewalsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Add Renewals
                </h3>
                <button
                  onClick={() => setShowRenewalsModal(false)}
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddRenewals();
                }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Congregation *
                    </label>
                    <select
                      value={renewalsData.congregation}
                      onChange={(e) =>
                        setRenewalsData({ ...renewalsData, congregation: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      required
                    >
                      <option value="">Select Congregation</option>
                      {congregations.map((congregation, index) => (
                        <option key={index} value={congregation}>
                          {congregation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={renewalsData.date}
                      onChange={(e) =>
                        setRenewalsData({ ...renewalsData, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={renewalsData.amount}
                      onChange={(e) =>
                        setRenewalsData({ ...renewalsData, amount: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of People *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={renewalsData.number_of_people}
                      onChange={(e) =>
                        setRenewalsData({ ...renewalsData, number_of_people: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRenewalsModal(false)}
                    className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Renewals
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Offertory Modal */}
      <AnimatePresence>
        {showOffertoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Add Offertory
                </h3>
                <button
                  onClick={() => setShowOffertoryModal(false)}
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddOffertory();
                }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={offertoryData.date}
                      onChange={(e) =>
                        setOffertoryData({ ...offertoryData, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Type or Title *
                    </label>
                    <input
                      type="text"
                      value={offertoryData.program_type}
                      onChange={(e) =>
                        setOffertoryData({ ...offertoryData, program_type: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="e.g., Sunday Service, Youth Conference, etc."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={offertoryData.venue}
                      onChange={(e) =>
                        setOffertoryData({ ...offertoryData, venue: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="e.g., Church Auditorium, Conference Hall, etc."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={offertoryData.amount}
                      onChange={(e) =>
                        setOffertoryData({ ...offertoryData, amount: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOffertoryModal(false)}
                    className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Add Offertory
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sales Modal */}
      <AnimatePresence>
        {showSalesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Add Sale
                </h3>
                <button
                  onClick={() => setShowSalesModal(false)}
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSales();
                }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={salesData.item_name}
                      onChange={(e) =>
                        setSalesData({ ...salesData, item_name: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="Dennis Opoku"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={salesData.price}
                      onChange={(e) =>
                        setSalesData({ ...salesData, price: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={salesData.date}
                      onChange={(e) =>
                        setSalesData({ ...salesData, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sold By *
                    </label>
                    <input
                      type="text"
                      value={salesData.sold_by}
                      onChange={(e) =>
                        setSalesData({ ...salesData, sold_by: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="Dennis Opoku"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSalesModal(false)}
                    className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Add Sale
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Expenses Modal */}
      <AnimatePresence>
        {showExpensesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-xl sm:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Add Expense
                </h3>
                <button
                  onClick={() => setShowExpensesModal(false)}
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddExpenses();
                }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={expensesData.date}
                      onChange={(e) =>
                        setExpensesData({ ...expensesData, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={expensesData.amount}
                      onChange={(e) =>
                        setExpensesData({ ...expensesData, amount: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (What the money was used for) *
                    </label>
                    <textarea
                      value={expensesData.description}
                      onChange={(e) =>
                        setExpensesData({ ...expensesData, description: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="Dennis Opoku"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who Made the Payment *
                    </label>
                    <input
                      type="text"
                      value={expensesData.paid_by}
                      onChange={(e) =>
                        setExpensesData({ ...expensesData, paid_by: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="Dennis Opoku"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExpensesModal(false)}
                    className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationsManagement;
