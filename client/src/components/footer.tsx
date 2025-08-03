import { Link } from "wouter";
import { Landmark, Facebook, Twitter, Youtube, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Landmark className="text-white" size={16} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Jansunwai</h3>
                <p className="text-sm text-gray-400">Indore Smart City</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering citizens with efficient grievance redressal through AI-powered solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/citizen-dashboard" className="text-gray-400 hover:text-white transition-colors">Submit Complaint</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Track Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Department Contacts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">User Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Officials</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Official Login</Link></li>
              <li><Link href="/official-dashboard" className="text-gray-400 hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Training Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="text-primary-400" size={16} />
                <span className="text-gray-400">+91 731 2345678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-primary-400" size={16} />
                <span className="text-gray-400">jansunwai@indoresmartcity.gov.in</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="text-primary-400 mt-1" size={16} />
                <span className="text-gray-400">
                  Indore Municipal Corporation<br />
                  Nehru Park, Indore 452001
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">© 2024 Indore Smart City. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
