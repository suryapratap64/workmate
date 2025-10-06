import React from "react";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Trust, Safety & Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Workmate Foundation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  CA Notice at Collection
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Apps & More */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Apps & More</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Desktop App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Mobile App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Enterprise Solutions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              <h4 className="text-lg">Follow Us</h4>
              <a href="#" className="hover:text-blue-400">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <FaLinkedin size={24} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <FaYoutube size={24} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <FaInstagram size={24} />
              </a>
            </div>
            <p className="text-sm text-gray-400">
              © 2023 - {new Date().getFullYear()} Workmate - All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
