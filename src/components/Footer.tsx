import { FC } from 'react';
import { MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

const ContactSection = () => (
  <div>
    <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contact Us</h3>
    <ul className="mt-4 space-y-2">
      <li className="flex items-center text-gray-400">
        <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
        <span>Kathmandu, Nepal</span>
      </li>
      <li className="flex items-center text-gray-400">
        <svg className="h-5 w-5 mr-2 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>info@trnevents.com</span>
      </li>
      <li className="flex items-center text-gray-400">
        <svg className="h-5 w-5 mr-2 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>+977 9812345678</span>
      </li>
    </ul>
  </div>
);

const SupportSection = () => (
  <div>
    <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h3>
    <ul className="mt-4 space-y-2">
      <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
      <li><a href="#" className="text-gray-400 hover:text-white">Ticket FAQs</a></li>
      <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
      <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
    </ul>
  </div>
);

const NewsletterSection = () => (
  <div>
    <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Subscribe to our Newsletter</h3>
    <form className="mt-4 flex flex-col sm:flex-row">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-4 py-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        className="mt-2 sm:mt-0 sm:ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Subscribe
      </button>
    </form>
  </div>
);

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <span className="ml-2 text-xl font-bold">TRN EVENTS</span>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              Your gateway to unforgettable experiences in Nepal and beyond.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="https://www.instagram.com/trn_events_nepal/"
                target="_blank"
                rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {/* Instagram SVG */}
                </svg>
              </a>
              <a href="https://www.facebook.com/trnevents"
                target="_blank"
                rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/trnevents"
                target="_blank"
                rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/company/trnevents"
                target="_blank"
                rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <SupportSection />
          <ContactSection />
          <NewsletterSection />
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} TRN Events. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;