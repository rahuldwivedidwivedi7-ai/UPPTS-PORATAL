import React from 'react';
import { Mail, Phone, Moon, User, Home, Info, FileText, Download, HelpCircle, PhoneCall, CheckCircle, Clock, Shield, Monitor, Users, Bell } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="landing-container">
      {/* Top Utility Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="contact-item"><Mail size={14} /> helpdesk@upptransfer.gov.in</span>
          <span className="contact-item"><Phone size={14} /> 0522-XXXXXXX</span>
        </div>
        <div className="top-bar-right">
          <span>Screen Reader Access</span>
          <div className="font-resizer">
            <button>A+</button>
            <button>A</button>
            <button>A-</button>
          </div>
          <button className="theme-toggle"><Moon size={14} /></button>
          <button className="lang-toggle">हिंदी में</button>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-brand">
          <img src="/assets/logo.png" alt="UP Police Logo" className="header-logo" />
          <div className="header-titles">
            <h2>UTTAR PRADESH POLICE</h2>
            <h1>TRANSFER & POSTING PORTAL</h1>
            <p>A Smart Transfer Management System</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="login-btn-large" onClick={onLoginClick}>
            <User size={20} />
            <div className="login-btn-text">
              <span className="login-title">User Login</span>
              <span className="login-sub">Login to your account</span>
            </div>
            <span className="chevron">▼</span>
          </button>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="main-nav">
        <ul>
          <li className="active"><Home size={16} /> Home</li>
          <li><Info size={16} /> About Us</li>
          <li><FileText size={16} /> Transfer Policy</li>
          <li><CheckCircle size={16} /> Transfer Orders</li>
          <li><FileText size={16} /> Guidelines</li>
          <li><Download size={16} /> Forms / Downloads</li>
          <li><HelpCircle size={16} /> FAQ</li>
          <li><PhoneCall size={16} /> Contact Us</li>
        </ul>
        <div className="nav-helpline">
          <PhoneCall size={18} />
          <div className="helpline-text">
            <span>Helpline</span>
            <strong>0522-XXXXXXX</strong>
          </div>
        </div>
      </nav>

      {/* Marquee Update */}
      <div className="update-ticker">
        <div className="ticker-label"><Bell size={16} /> Latest Update:</div>
        <div className="ticker-text-container">
          <div className="ticker-text">Online transfer application window is open. Last date to apply: 31 May 2026.</div>
        </div>
        <button className="view-all-btn">View All Notifications <span className="badge">3</span></button>
      </div>

      {/* Main Layout Grid */}
      <main className="landing-main-grid">
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          <div className="card red-card">
            <div className="card-header"><CheckCircle size={18} /> Quick Actions</div>
            <ul className="action-list">
              <li><span>Apply for Transfer</span> <span className="arrow">&gt;</span></li>
              <li><span>Mutual Transfer Request</span> <span className="arrow">&gt;</span></li>
              <li><span>View Application Status</span> <span className="arrow">&gt;</span></li>
              <li><span>Transfer Orders</span> <span className="arrow">&gt;</span></li>
              <li><span>Cancellation Request</span> <span className="arrow">&gt;</span></li>
            </ul>
          </div>

          <div className="card purple-card">
            <div className="card-header"><FileText size={18} /> Important Links</div>
            <ul className="link-list">
              <li><FileText size={14} /> Transfer Policy</li>
              <li><FileText size={14} /> Government Orders</li>
              <li><FileText size={14} /> Act / Rules</li>
              <li><FileText size={14} /> Frequently Asked Questions</li>
              <li><FileText size={14} /> User Manual / Help Videos</li>
            </ul>
          </div>
        </aside>

        {/* Center Circular UI */}
        <section className="center-hub">
          <div className="hub-container">
            <div className="hub-center">
              <img src="/assets/logo.png" alt="UP Police" />
              <h3>TRANSFER &<br/>POSTING SYSTEM</h3>
              <p>Uttar Pradesh Police</p>
            </div>
            
            {/* Circular Nodes */}
            <div className="hub-node node-1 red-node">
              <div className="node-icon"><Users size={24} /></div>
              <span>Apply for<br/>Transfer</span>
            </div>
            <div className="hub-node node-2 blue-node">
              <div className="node-icon"><FileText size={24} /></div>
              <span>View<br/>Application Status</span>
            </div>
            <div className="hub-node node-3 green-node">
              <div className="node-icon"><CheckCircle size={24} /></div>
              <span>Transfer<br/>Orders</span>
            </div>
            <div className="hub-node node-4 purple-node">
              <div className="node-icon"><FileText size={24} /></div>
              <span>Cancellation<br/>Request</span>
            </div>
            <div className="hub-node node-5 orange-node">
              <div className="node-icon"><FileText size={24} /></div>
              <span>Transfer<br/>Policy</span>
            </div>
            <div className="hub-node node-6 cyan-node">
              <div className="node-icon"><Download size={24} /></div>
              <span>Forms /<br/>Downloads</span>
            </div>
            <div className="hub-node node-7 deep-purple-node">
              <div className="node-icon"><PhoneCall size={24} /></div>
              <span>Helpdesk /<br/>Support</span>
            </div>
            <div className="hub-node node-8 lime-node">
              <div className="node-icon"><Users size={24} /></div>
              <span>Mutual<br/>Transfer Request</span>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="card blue-card">
            <div className="card-header"><Users size={18} /> Dashboard Overview</div>
            <ul className="stats-list">
              <li>
                <span className="stat-label"><Users size={14} /> Total Employees</span>
                <span className="stat-value">1,25,430</span>
              </li>
              <li>
                <span className="stat-label"><FileText size={14} /> Transfer Applications</span>
                <span className="stat-value">8,764</span>
              </li>
              <li>
                <span className="stat-label"><CheckCircle size={14} /> Applications Approved</span>
                <span className="stat-value">3,456</span>
              </li>
              <li>
                <span className="stat-label"><Clock size={14} /> Applications Pending</span>
                <span className="stat-value">5,308</span>
              </li>
              <li>
                <span className="stat-label"><FileText size={14} /> Orders Issued (This Month)</span>
                <span className="stat-value">1,245</span>
              </li>
            </ul>
          </div>

          <div className="card yellow-card">
            <div className="card-header"><CheckCircle size={18} /> Latest Transfer Orders <span className="view-all">View All</span></div>
            <ul className="orders-list">
              <li><span>Order No. 1234/2026</span> <span className="order-date">20 May 2026</span></li>
              <li><span>Order No. 1233/2026</span> <span className="order-date">19 May 2026</span></li>
              <li><span>Order No. 1232/2026</span> <span className="order-date">18 May 2026</span></li>
              <li><span>Order No. 1231/2026</span> <span className="order-date">17 May 2026</span></li>
              <li><span>Order No. 1230/2026</span> <span className="order-date">16 May 2026</span></li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Feature Highlights Footer */}
      <section className="features-grid">
        <div className="feature-card f-blue">
          <Shield size={32} />
          <div className="feature-text">
            <h4>Transparency</h4>
            <p>Transparent & automated transfer process</p>
          </div>
        </div>
        <div className="feature-card f-green">
          <CheckCircle size={32} />
          <div className="feature-text">
            <h4>Security</h4>
            <p>Secure role-based access for all users</p>
          </div>
        </div>
        <div className="feature-card f-yellow">
          <Clock size={32} />
          <div className="feature-text">
            <h4>Timely Processing</h4>
            <p>Faster approval and order generation</p>
          </div>
        </div>
        <div className="feature-card f-purple">
          <Monitor size={32} />
          <div className="feature-text">
            <h4>Anywhere Access</h4>
            <p>Access portal from anywhere, anytime</p>
          </div>
        </div>
        <div className="feature-card f-cyan">
          <PhoneCall size={32} />
          <div className="feature-text">
            <h4>24x7 Helpdesk</h4>
            <p>Dedicated support for all users</p>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-left">
          <img src="/assets/logo.png" alt="Logo" className="footer-logo" />
          <span>© 2026 Uttar Pradesh Police. All Rights Reserved.</span>
        </div>
        <div className="footer-center">
          <span>Best viewed in Google Chrome 90+</span>
          <span className="divider">|</span>
          <span>Website owned by Police Headquarters, Uttar Pradesh</span>
        </div>
        <div className="footer-right">
          <span>National Informatics Centre</span>
        </div>
      </footer>
    </div>
  );
};
