import Sidebar from "./Sidebar";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import { Link, useNavigate } from "react-router";
import EtcLogo from "../assets/Images/ETClogo.png";
import errorGif from "../assets/Images/404-error.gif";
import successGif from "../assets/Images/SuccessGif.gif";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import books from "../assets/Images/books.png"
import cliq from "../assets/Images/cliq.png"
import crm from "../assets/Images/crm.png"
import desk from "../assets/Images/desk.png"
import mail from "../assets/Images/mail.png"
import people from "../assets/Images/people.png"
import project from "../assets/Images/projects.png"
import salesiq from "../assets/Images/salesiq.png"
import workdrive from "../assets/Images/workdrive.png"


import {
  FolderOpen,
  Timer,
  ListTodo,
  CalendarClock,
  Target,
  AlertTriangle,
  AlarmClock,
  FileText,
  MoveLeft
} from "lucide-react";


export const Bundeltab = () => {
  const [activeTab, setActiveTab] = useState("ZohoOne");
  const [activePlan, setActivePlan] = useState("Basic");
  const productsName = sessionStorage.getItem("productName");
  const [manualSelections, setManualSelections] = useState({});
  const [total, setTotal] = useState("");
  const [autoSelectedByRoles, setAutoSelectedByRoles] = useState([]);
  const [customSelections, setCustomSelections] = useState({});
  const users_last_name = useSelector((state) => state.user.last_name);
  const users_first_name = useSelector((state) => state.user.first_name);
  console.log("users_firstname", users_first_name);
  console.log("users_lastname", users_last_name);
  const emailUser = useSelector((state) => state.user.email_id);
  const [showGifPopup, setShowGifPopup] = useState(false);
  const [popupType, setPopupType] = useState("success");
  const [submitLoading, setSubmitLoading] = useState(false);
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/bundlePage")
  };
  const [tasks] = useState(
    [
      {
        "Product": "Zoho People",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho Books",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho Cliq",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho Salesiq",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho CRM",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho Workdrive",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho Mail",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho Projects",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      },
      {
        "Product": "Zoho desk",
        "Modules": [
          {
            "Module": "Organisation Setup",
            "Activities": [
              {
                "Subtask": "Company Details",
                "Description": "We will be setting up your organization's name, address, contact information, and other relevant details to establish a profile in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              },
              {
                "Subtask": "Base Currency and Fiscal Year Details",
                "Description": "We will set the primary currency for transactions and define the fiscal year start and end dates for accurate financial reporting within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "User Details",
            "dependsOn": ["Organisation Setup", "Roles and Permissions"],
            "Activities": [
              {
                "Subtask": "User Details",
                "Description": "We will be adding new users, defining roles, and modifying access levels through user profiles that include names, email addresses, and assigned permissions to control access to features.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 0.5
              }
            ]
          },
          {
            "Module": "Domain Verification",
            "Activities": [
              {
                "Subtask": "Domain Verification",
                "Description": "We would verify your organization’s domain in Zoho Books to enable branded email notifications and improve communication professionalism.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 6
              }
            ]
          },
          {
            "Module": "Adding Bank Details",
            "Activities": [
              {
                "Subtask": "Adding Bank Details",
                "Description": "Once you provide bank details, we will add your bank account information in Zoho Books to facilitate transactions and streamline bank reconciliations.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          },
          {
            "Module": "Add Chart of Accounts",
            "Activities": [
              {
                "Subtask": "Add Chart of Accounts",
                "Description": "There are 30+ default accounts under different categories like Assets, Liability, Equity, Income, and Expense available in Zoho Books. We will share the list of Chart of Accounts available by default. If you require additional accounts, we will create them to categorize all financial transactions.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 4
              }
            ]
          },
          {
            "Module": "Opening Balances",
            "Activities": [
              {
                "Subtask": "Opening Balances",
                "Description": "Once you provide Accounts Receivable, Accounts Payable, and other account balances, we will set initial balances for all accounts in Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 3
              }
            ]
          },
          {
            "Module": "Add Tax Details",
            "Activities": [
              {
                "Subtask": "Add Tax Details",
                "Description": "We will configure tax settings, including rates and rules, to ensure compliance and automate calculations within Zoho Books.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Add Branch Details (If Applicable)",
            "Activities": [
              {
                "Subtask": "Add Branch Details",
                "Description": "If you require multiple branches, we will configure them in Zoho Books, including names and locations, to facilitate branch-specific financial tracking.",
                "Basic": true,
                "Intermediate": true,
                "Advanced": true,
                "EstimatedTime": 1
              }
            ]
          },
          {
            "Module": "Configure Transaction Series (If Applicable)",
            "Activities": [
              {
                "Subtask": "Configure Transaction Series",
                "Description": "We will configure transaction series for multiple branches in Zoho Books.",
                "Basic": false,
                "Intermediate": false,
                "Advanced": true,
                "EstimatedTime": 2
              }
            ]
          }
        ]
      }
    ]
  );

  const calculateEstimatedTime = () => {
    if (!tasks || !Array.isArray(tasks)) {
      return 0;
    }

    let total = 0;

    tasks.forEach((task) => {
      // Access 'Modules' instead of 'Activities'
      if (task.Modules && Array.isArray(task.Modules)) {
        task.Modules.forEach((module) => {
          // Now access 'Activities' from each module
          if (module.Activities && Array.isArray(module.Activities)) {
            module.Activities.forEach((activity) => {
              const key = `${module.Module}-${activity.Subtask}`;
              if (activePlan === "Custom") {
                if (customSelections[key]) total += activity.EstimatedTime;
              } else if (activity[activePlan]) {
                total += activity.EstimatedTime;
              }
            });
          }
        });
      }
    });

    return total;
  };
  useEffect(() => {
    const total = calculateEstimatedTime();
    setTotal(total);
    console.log("Updated total", total);
  }, [customSelections, activePlan, tasks]);

  const getPlanColumnStyle = (planType) =>
    activePlan === planType
      ? "border-l-[1px] border-r-[1px] border-[#008F39] bg-gradient-to-b from-[#008F39]/10 via-[#008799]/10 to-[#00417A]/10"
      : "";


  const Tabs = [
    {
      id: "ZohoOne",
      label: "Zoho People",
      icon: people
    },
    {
      id: "ZohoBooks",
      label: "Zoho Books",
      icon: books
    },
    {
      id: "ZohoCliq",
      label: "Zoho Cliq",
      icon: cliq,
    },
    {
      id: "ZohoSalesiq",
      label: "Zoho Salesiq",
      icon: salesiq,
    },
    {
      id: "ZohoCRM",
      label: "Zoho CRM",
      icon: crm,
    },
    {
      id: "ZohoWorkdrive",
      label: "Zoho Workdrive",
      icon: workdrive,
    },
    {
      id: "ZohoMail",
      label: "Zoho Mail",
      icon: mail,
    },
    {
      id: "ZohoProjects",
      label: "Zoho projects",
      icon: project,
    },
    {
      id: "ZohoDesk",
      label: "Zoho desk",
      icon: desk,
    },
  ];

  const tabToProductMap = {
    ZohoOne: "Zoho People",
    ZohoBooks: "Zoho Books",
    ZohoCliq: "Zoho Cliq",
    ZohoSalesiq: "Zoho Salesiq",
    ZohoCRM: "Zoho CRM",
    ZohoWorkdrive: "Zoho Workdrive",
    ZohoMail: "Zoho Mail",
    ZohoProjects: "Zoho Projects",
    ZohoDesk: "Zoho Desk",
  };

  const tabs = [...Tabs];
  const getFilteredTasks = () => {
    const productName = tabToProductMap["ZohoOne"];
    return productName
      ? tasks?.filter((task) => task.Product === productName)
      : [];
  };


  const isAnyCustomCheckboxSelected = () => {
    return Object.values(customSelections).some(
      (selected) => selected === true
    );
  };

  const handleSubmit = async () => {
    const selectedTasks = [];

    tasks.forEach((task) => {
      task.Modules.forEach((module) => {
        module.Activities.forEach((activity) => {
          const key = `${task.Product}-${activity.Subtask}`;

          let isIncluded = false;
          if (activePlan === "Custom") {
            isIncluded = customSelections[key];
          } else {
            isIncluded = activity[activePlan];
          }

          if (isIncluded) {
            selectedTasks.push({
              Module: module.Module,
              Subtask: activity.Subtask,
              Description: activity.Description,
              SelectedPlan: activePlan,
              EstimatedTime: activity.EstimatedTime,
            });
          }
        });
      });
    });

    const payload = {
      user: users_first_name,
      LastName: users_last_name,
      ProductName: productsName,
      Email: emailUser,
      Plans: selectedTasks,
      crmid: "",
    };

    try {
      setSubmitLoading(true);
      const pdfBlob = await generatePDF(payload);
      const formData = new FormData();
      formData.append("pdf", pdfBlob, "Generated.pdf");
      formData.append("payload", JSON.stringify(payload));

      const response = await fetch(
        "/server/elite_tech_corp_function/insert-enquiry",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit enquiry");

      const data = await response.json();
      console.log("Submission Success:", data);

      setPopupType("success");
      setShowGifPopup(true);
      setTimeout(() => setShowGifPopup(false), 7000);
    } catch (error) {
      console.error("Submission Error:", error);
      setPopupType("error");
      setShowGifPopup(true);
      setTimeout(() => setShowGifPopup(false), 2500);
    } finally {
      setSubmitLoading(false);
      setTimeout(() => window.location.reload(), 5000);
    }
  };


  const handleCustomCheckboxChange = (module, subtask, isChecked) => {
    const key = `${module}-${subtask}`;
    setCustomSelections((prev) => ({ ...prev, [key]: isChecked }));

    if (isChecked) {
      setManualSelections((prev) => ({ ...prev, [key]: true }));
    } else if (!manualSelections[key]) {
      setManualSelections((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
    const handleDependencies = (mod) => {
      const task = tasks.find((t) => t.Module === mod);
      if (!task) return;

      const depModules = task.dependsOn || [];

      depModules.forEach((dep) => {
        const depTask = tasks.find((t) => t.Module === dep);
        if (!depTask) return;

        depTask.Activities.forEach((activity) => {
          const depKey = `${dep}-${activity.Subtask}`;

          if (isChecked) {
            setCustomSelections((prev) => ({ ...prev, [depKey]: true }));
            if (!manualSelections[depKey]) {
              setAutoSelectedByRoles((prev) => [...new Set([...prev, depKey])]);
            }
          } else {
            setCustomSelections((prev) => {
              const updated = { ...prev };
              if (!manualSelections[depKey]) delete updated[depKey];
              return updated;
            });
            setAutoSelectedByRoles((prev) => prev.filter((k) => k !== depKey));
          }

          // Recurse further
          handleDependencies(dep);
        });
      });
    };

    handleDependencies(module);
  };


  const generatePDF = async (payload) => {
    const doc = new jsPDF({ compress: true });
    // const doc = new jsPDF({ compress: true });

    const toBase64 = (url, opacity = 1.0) =>
      // const toBase64 = (url, opacity = 1.0) =>
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, 0, 0);

                resolve(canvas.toDataURL("image/png"));
                resolve(canvas.toDataURL("image/png"));
              };
              img.onerror = reject;
              img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });

    const compressedImage = await toBase64(EtcLogo, 1.0);
    const watermarkImage = await toBase64(EtcLogo, 0.1);

    const drawExtras = (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const wmWidth = 80;
      const wmHeight = 100;
      const centerX = (pageWidth - wmWidth) / 2;
      const centerY = (pageHeight - wmHeight) / 2;
      doc.addImage(watermarkImage, "JPEG", centerX, centerY, wmWidth, wmHeight);
      doc.addImage(watermarkImage, "JPEG", centerX, centerY, wmWidth, wmHeight);

      if (data.pageNumber === 1) {
        const logoWidth = 30;
        const logoHeight = 40;
        const margin = 10;
        const logoX = pageWidth - logoWidth - margin;
        const logoY = margin;
        doc.addImage(
          compressedImage,
          "JPEG",
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
        doc.addImage(
          compressedImage,
          "JPEG",
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
      }
    };

    doc.setFontSize(16);
    doc.setTextColor(18, 95, 167);
    doc.setFont(undefined, "bold");
    doc.text("Enquiry Submission Details", 14, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    doc.setFont(undefined, "bold");
    doc.setFont(undefined, "bold");
    doc.text("Name: ", 14, 30);
    doc.setFont(undefined, "normal");
    doc.text(`${payload.user} ${payload.LastName}`, 40, 30);

    doc.setFont(undefined, "bold");
    doc.text("Email: ", 14, 37);
    doc.setFont(undefined, "normal");
    doc.text(payload.Email, 40, 37);

    doc.setFont(undefined, "bold");
    doc.text("Product: ", 14, 44);
    doc.setFont(undefined, "normal");
    doc.text(payload.ProductName, 40, 44);

    const gap = 12;
    const selectedEnquiriesY = 44 + gap;

    doc.setFont(undefined, "bold");
    doc.text("Selected Enquiries:", 14, selectedEnquiriesY);

    // Table rows
    // Table rows
    const tableRows = payload.Plans.map((task) => [
      task.Module,
      task.Subtask,
      task.Description,
      task.SelectedPlan,
      `${task.EstimatedTime}`,
      `${task.EstimatedTime}`,
    ]);

    const totalHours = payload.Plans.reduce(
      (sum, t) => sum + Number(t.EstimatedTime || 0),
      0
    );

    tableRows.push([
      {
        content: "Total Hours",
        colSpan: 4,
        styles: {
          halign: "right",
          fontStyle: "bold",
          fillColor: [230, 230, 230],
        },
      },
      {
        content: `${totalHours}`,
        styles: { fontStyle: "bold", fillColor: [230, 230, 230] },
      },
    ]);

    doc.autoTable({
      head: [["Module", "Subtask", "Description", "Plan", "Est.Hr"]],
      body: tableRows,
      startY: 60,
      styles: {
        fontSize: 10,
        align: "center",
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        lineColor: "#05A4E5",
        lineWidth: 0.1,
      },
      headStyles: {
        halign: "center",
        fontSize: 12,
        fillColor: "#1F6CB6",
        textColor: [255, 255, 255],
      },
      columnStyles: {
        2: { cellWidth: 70 },
        4: { cellWidth: 20, halign: "center" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 0) {
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: drawExtras,
    });

    // Save and return blob
    return new Promise((resolve) => {
      const pdfBlob = doc.output("blob");
      doc.save("WatermarkedPDF.pdf");
      resolve(pdfBlob);
    });
  };
  const renderTabContent = () => {
    const filteredTasks = getFilteredTasks();
    console.log("filter data", filteredTasks);


    if (!filteredTasks.length) {
      return <p className="text-gray-500">No tasks available for this product.</p>;
    }

    return (
      <div>

        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full lg:w-50vw  xl:w-full overflow-x-auto  text-md">
              <thead className="sticky top-0 bg-gray-200 text-gray-700 font-semibold z-10 py-4">
                <tr className="text-center">
                  <th className="px-4 py-4">Module</th>
                  <th className="px-4 py-4">Subtask</th>
                  <th
                    className={`px-4 py-4 w-[180px] ${getPlanColumnStyle(
                      "Basic"
                    )}`}
                  >
                    Basic
                  </th>
                  <th
                    className={`px-4 py-4 w-[180px] ${getPlanColumnStyle(
                      "Intermediate"
                    )}`}
                  >
                    Intermediate
                  </th>
                  <th
                    className={`px-4 py-4 w-[180px] ${getPlanColumnStyle(
                      "Advanced"
                    )}`}
                  >
                    Advanced
                  </th>

                  <th
                    className={`text-center px-4 py-2 ${getPlanColumnStyle(
                      "Custom"
                    )}`}
                  >
                    Custom
                  </th>
                </tr>
              </thead>

              <tbody className="max-h-[50vh]">
                {filteredTasks.map((task) =>
                  task.Modules.map((module) =>
                    module.Activities.map((activity, activityIndex) => (
                      <tr
                        key={`${task.Product}-${module.Module}-${activity.Subtask}`}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        {activityIndex === 0 && (
                          <td
                            rowSpan={module.Activities.length}
                            className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700"
                          >
                            {module.Module}
                          </td>
                        )}
                        <td className="px-4 py-3 relative text-gray-700">
                          {activity.Subtask}
                          <Tippy
                            placement="right"
                            content={activity.Description}
                            theme="light-gray"
                            animation="scale"
                            className="bg-gray-500"
                          >
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-xs text-gray-600 ">
                              <i className="fa fa-info-circle"></i>
                            </span>
                          </Tippy>
                        </td>
                        <td
                          className={`text-center ${getPlanColumnStyle("Basic")}`}
                        >
                          <div className="h-full px-4 py-3">
                            <input
                              type="checkbox"
                              className={`w-4 h-4 cursor-default border-white ${activePlan === "Basic" && activity.Basic
                                ? "accent-green-600 border"
                                : "accent-green-600"
                                }`}
                              checked={activity.Basic}
                              readOnly
                            />
                          </div>
                        </td>

                        <td
                          className={`text-center ${getPlanColumnStyle(
                            "Intermediate"
                          )}`}
                        >
                          <div className="h-full px-4 py-3">
                            <input
                              type="checkbox"
                              className={`w-4 h-4 cursor-default border-white ${activePlan === "Intermediate" &&
                                activity.Intermediate
                                ? "accent-green-600 border"
                                : "accent-green-600"
                                }`}
                              checked={activity.Intermediate}
                              readOnly
                            />
                          </div>
                        </td>

                        <td
                          className={`text-center ${getPlanColumnStyle(
                            "Advanced"
                          )}`}
                        >
                          <div className="h-full px-4 py-3">
                            <input
                              type="checkbox"
                              className={`w-4 h-4 cursor-default border-white ${activePlan === "Advanced" && activity.Advanced
                                ? "accent-green-600 border"
                                : "accent-green-600"
                                }`}
                              checked={activity.Advanced}
                              readOnly
                            />
                          </div>
                        </td>

                        <td
                          className={`text-center ${getPlanColumnStyle(
                            "Custom"
                          )}`}
                        >
                          <input
                            type="checkbox"
                            className={`accent-green-600 w-4 h-4 ${activePlan === "Custom"
                              ? "cursor-pointer"
                              : "cursor-not-allowed"
                              }`}
                            checked={
                              !!customSelections[
                              `${task.Product}-${activity.Subtask}`
                              ]
                            }
                            disabled={activePlan !== "Custom"}
                            onChange={(e) =>
                              handleCustomCheckboxChange(
                                task.Product,
                                activity.Subtask,
                                e.target.checked
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
              <tfoot className="sticky bottom-0 bg-gray-100 z-10">
                <tr className="text-center">
                  <td colSpan={2} className="py-2 font-bold text-gray-600">
                    Select Access Level
                  </td>
                  {["Basic", "Intermediate", "Advanced", "Custom"].map((plan) => (
                    <td
                      key={plan}
                      className={`cursor-pointer transition px-4 py-3 font-bold rounded ${activePlan === plan
                        ? "bg-gradient-to-r from-[#008F39] via-[#008799] to-[#00417A] text-white"
                        : "bg-white border hover:bg-gray-200 text-gray-700"
                        }`}
                      onClick={() => setActivePlan(plan)}
                    >
                      {activePlan === plan ? "Active" : "Access"}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="mt-4 text-right pr-6 text-lg font-medium text-gray-700">
          Total Estimated Time ({activePlan}):{" "}
          <span className="text-green-700 font-bold">{total} hrs</span>
        </div>

        {(activePlan === "Advanced" ||
          activePlan === "Intermediate" ||
          activePlan === "Basic" ||
          (activePlan === "Custom" && isAnyCustomCheckboxSelected())) && (
            <div className="mt-4 text-center text-lg font-medium text-gray-700">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-[#008F40] to-[#00410C] hover:opacity-90 text-white px-20 py-2 rounded-2xl text-md font-semibold shadow-lg transition-all duration-300"
              >
                {submitLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
      </div>


    )
  };


  return (
    <Sidebar>
      <div className=" overflow-y-auto lg:h-[100vh] md:h-[100vh]  md p-4">
        <div>
          <nav className="flex mb-3" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2  !pl-0">
              <li className="inline-flex items-center">
                <Link
                  to="/dashboard"
                  className="text-[14px] text-gray-400 hover:text-gray-500"
                >
                  Dashboard
                </Link>
              </li>
              <span>/</span>
              <li>
                <Link
                  to="/bundlePage"
                  className="text-[14px] text-gray-400 hover:text-gray-500"
                >
                  Bundle Solutions
                </Link>
              </li>
              <span>/</span>
              <li>
                <span className="text-[14px] text-[#DC2626]">Zoho One Products</span>
              </li>

            </ol>
          </nav>
        </div>
        <div className="bg-white md:w-[79vw] lg:w-[85vw] xl:w-full  dark:bg-gray-800 pt-2 mb-4 shadow-sm rounded-lg">
          <ul
            className="flex gap-0 md:gap-6 text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 
                 overflow-x-auto no-scrollbar whitespace-nowrap px-1 py-2"
            role="tablist"
          >
            {Tabs.map((tab) => (
              <li key={tab.id} role="presentation" className="flex-shrink-0 justify-center">
                <button
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative text-center whitespace-nowrap px-3 py-3 gap-2 ml-5 flex justify-center transition-all duration-300 ease-in-out
                  ${activeTab === tab.id
                      ? "text-[#008799] font-bold after:w-full after:bg-gradient-to-r after:from-[#008F39] after:via-[#008799] after:to-[#00417A]"
                      : "text-gray-500 hover:text-[#008799] after:w-0 after:hover:w-3/4 after:bg-gray-300"
                    }
                  after:content-[''] after:absolute after:h-[2px] after:rounded-full after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:transition-all after:duration-300`}
                >
                  <div className="flex justify-center">
                    <img src={tab.icon} alt={tab.label} className="w-6 h-6" />
                  </div>
                  <div className="mt-1">{tab.label}</div>
                </button>
              </li>
            ))}
          </ul>

          <div className="p-4 rounded-b-lg dark:bg-gray-800 bg-white transition-all duration-500 ease-in-out">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>


      <AnimatePresence>
        {showGifPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white shadow-2xl rounded-2xl p-6 max-w-sm w-full flex flex-col items-center"
            >
              <img
                src={popupType === "success" ? successGif : errorGif}
                alt={popupType === "success" ? "Success" : "Error"}
                className="w-94 h-94 object-cover"
              />
              <h2
                className={`text-xl font-bold mb-2 ${popupType === "success" ? "text-green-600" : "text-red-600"
                  }`}
              >
                {popupType === "success"
                  ? "Submission Successful!"
                  : "Submission Failed!"}
              </h2>
              <p className="text-gray-600 text-sm text-center">
                {popupType === "success"
                  ? "Your plan details were submitted successfully."
                  : "There was a problem submitting your plan details. Please try again."}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </Sidebar>

  );
}