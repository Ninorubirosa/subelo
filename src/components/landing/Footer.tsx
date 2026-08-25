'use client'

import Image from 'next/image'

const footerLinks = {
  Product: ['Features', 'Distribution', 'Analytics', 'AI Mastering'],
  Resources: ['Blog', 'Help Center', 'Artist Guide', 'API Docs', 'Status'],
  Company: ['About', 'Careers', 'Press Kit', 'Contact'],
  Legal: ['Terms of Service', 'Privacy Policy', 'Cookie Policy'],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-mark.png" alt="" width={243} height={125} className="h-7 w-auto" />
              <span className="text-xl font-bold tracking-tight">
                SUB<span className="text-lime">ELO</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Music distribution built for the modern independent artist.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Subelo Music. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: 'X', name: 'X (Twitter)' },
              { label: 'IG', name: 'Instagram' },
              { label: 'YT', name: 'YouTube' },
              { label: 'TT', name: 'TikTok' },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.name}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground hover:bg-lime hover:text-black transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
