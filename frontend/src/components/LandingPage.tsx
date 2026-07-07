import React from 'react';
import { Mail, Phone, Moon, User, Home, Info, FileText, Download, HelpCircle, PhoneCall, CheckCircle, Clock, Shield, Monitor, Users, Bell, Globe, MessageCircle, Video, Camera, HeadphonesIcon, Folder, AlertCircle, BarChart2 } from 'lucide-react';
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
          <span className="contact-item"><Mail size={14} /> helpdesk@uppolice.gov.in</span>
          <span className="contact-item"><Phone size={14} /> 0522-2393100</span>
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

      {/* Hero Banner Section (Final Designed Image) */}
      <section className="hero-section">
        <img src="/assets/final-banner.png" alt="UP Police Transfer Portal" className="hero-banner-img" />
      </section>

      {/* Navigation Menu (Dark Blue with Red accents) */}
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
        <div className="nav-actions">
          <button className="nav-login-btn" onClick={onLoginClick}>
            <User size={18} />
            <div className="nav-login-text">
              <span className="nav-login-title">User Login</span>
            </div>
            <span className="chevron">▼</span>
          </button>
        </div>
      </nav>

      {/* Marquee Update */}
      <div className="update-ticker-wrapper">
        <div className="update-ticker">
          <div className="ticker-label"><Bell size={16} /> Latest Update:</div>
          <div className="ticker-text-container">
            <div className="ticker-text">Online transfer application window is open. Last date to apply: 31 May 2026.</div>
          </div>
          <button className="view-all-btn">View All Notifications <span className="badge">3</span></button>
        </div>
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

          <div className="card blue-card">
            <div className="card-header"><FileText size={18} /> Important Links</div>
            <ul className="link-list">
              <li><FileText size={14} /> Transfer Policy <span className="arrow">&gt;</span></li>
              <li><FileText size={14} /> Government Orders <span className="arrow">&gt;</span></li>
              <li><FileText size={14} /> Act / Rules <span className="arrow">&gt;</span></li>
              <li><FileText size={14} /> Frequently Asked Questions <span className="arrow">&gt;</span></li>
              <li><FileText size={14} /> User Manual / Help Videos <span className="arrow">&gt;</span></li>
            </ul>
          </div>
        </aside>

        {/* Center Content - Our Services Grid */}
        <section className="center-services">
          <div className="services-header">
            <hr className="line" />
            <h3>Our Services</h3>
            <hr className="line" />
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon s-red"><Users size={28} /></div>
              <h4>Apply for Transfer</h4>
              <p>Apply online for transfer</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-green"><Users size={28} /></div>
              <h4>Mutual Transfer Request</h4>
              <p>Request mutual transfer</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-blue"><FileText size={28} /></div>
              <h4>View Application Status</h4>
              <p>Track your application</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-orange"><FileText size={28} /></div>
              <h4>Transfer Orders</h4>
              <p>View transfer orders</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-teal"><FileText size={28} /></div>
              <h4>Transfer Policy</h4>
              <p>View transfer guidelines</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-purple"><PhoneCall size={28} /></div>
              <h4>Helpdesk / Support</h4>
              <p>Get help & support</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-yellow"><Download size={28} /></div>
              <h4>Forms / Downloads</h4>
              <p>Download required forms</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-darkblue"><Folder size={28} /></div>
              <h4>Service Records</h4>
              <p>View service details</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-pink"><AlertCircle size={28} /></div>
              <h4>Notifications</h4>
              <p>View all notifications</p>
            </div>
            <div className="service-card">
              <div className="service-icon s-indigo"><BarChart2 size={28} /></div>
              <h4>Reports & Statistics</h4>
              <p>View detailed reports</p>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="card solid-blue-card">
            <div className="card-header"><BarChart2 size={18} /> Dashboard Overview</div>
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

          <div className="card solid-yellow-card mt-4">
            <div className="card-header"><CheckCircle size={18} /> Latest Transfer Orders <span className="view-all">View All</span></div>
            <ul className="orders-list">
              <li><span>Order No. 1234/2025</span> <span className="order-date">20 May 2025</span></li>
              <li><span>Order No. 1233/2025</span> <span className="order-date">19 May 2025</span></li>
              <li><span>Order No. 1232/2025</span> <span className="order-date">18 May 2025</span></li>
              <li><span>Order No. 1231/2025</span> <span className="order-date">17 May 2025</span></li>
              <li><span>Order No. 1230/2025</span> <span className="order-date">16 May 2025</span></li>
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
          <HeadphonesIcon size={32} />
          <div className="feature-text">
            <h4>24x7 Helpdesk</h4>
            <p>Dedicated support for all users</p>
          </div>
        </div>
      </section>

      {/* Detailed Dark Blue Footer */}
      <footer className="detailed-footer">
        <div className="footer-top">
          <div className="footer-col brand-col">
            <img src="/assets/logo.png" alt="Logo" className="footer-logo" />
            <span>© 2026 Uttar Pradesh Police. All Rights Reserved.</span>
          </div>
          <div className="footer-col nic-col">
            <span className="supported-text">Supported By</span>
            <span>Uttar Pradesh Police Technical Services</span>
            <div className="nic-logo-box">UPPTS</div>
          </div>
          <div className="footer-col contact-col">
            <span className="col-title">Contact Us</span>
            <div className="contact-detail"><Monitor size={14}/> Police Headquarters, Gomti Nagar, Lucknow, Uttar Pradesh - 226010</div>
            <div className="contact-detail"><Phone size={14}/> 0522-2393100 &nbsp; | &nbsp; <Mail size={14}/> helpdesk@uppolice.gov.in</div>
          </div>
          <div className="footer-col social-col">
            <span className="col-title">Stay Connected</span>
            <div className="social-icons">
              <span className="social-icon fb"><Globe size={16}/></span>
              <span className="social-icon tw"><MessageCircle size={16}/></span>
              <span className="social-icon yt"><Video size={16}/></span>
              <span className="social-icon ig"><Camera size={16}/></span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-links">
            <span>Privacy Policy</span> | <span>Terms & Conditions</span> | <span>Disclaimer</span>
          </div>
          <div className="footer-browser">
            Best viewed in Chrome, Firefox & Edge
          </div>
        </div>
      </footer>
    </div>
  );
};
