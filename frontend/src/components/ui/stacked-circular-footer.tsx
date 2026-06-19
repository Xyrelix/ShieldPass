import { Icons } from "./icons"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { MessageCircle, Globe } from "lucide-react"
import { Link } from "react-router-dom"

function StackedCircularFooter() {
  return (
    <footer className="bg-transparent border-t border-white/10 py-12 relative z-10 pointer-events-auto">
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col items-center">
          <div className="mb-8 rounded-full bg-white/5 p-8 border border-white/10 backdrop-blur-sm">
            <Icons.logo className="text-white w-8 h-8" />
          </div>
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-white/70 hover:text-white transition-colors">About</Link>
            <Link to="/docs" className="text-white/70 hover:text-white transition-colors">Docs</Link>
          </nav>
          <div className="mb-8 flex space-x-4">
            <a href="https://github.com/Xyrelix/ShieldPass" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
            <a href="https://x.com/ShieldPass" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Icons.twitter className="h-4 w-4" />
                <span className="sr-only">X (Twitter)</span>
              </Button>
            </a>
          </div>
          <div className="mb-8 w-full max-w-xl">
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input 
                  id="email" 
                  placeholder="Subscribe to ShieldPass updates" 
                  type="email" 
                  className="rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20" 
                />
              </div>
              <Button type="submit" className="rounded-full bg-black text-white border border-white/20 hover:bg-white/10">
                Subscribe
              </Button>
            </form>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/50 font-light">
              © 2026 ShieldPass. All rights reserved. Zero-Knowledge P2P Trading on Stellar.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }
