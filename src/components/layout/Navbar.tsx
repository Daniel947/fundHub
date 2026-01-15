import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Wallet, Heart, LayoutDashboard, User, LogOut } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useCampaigns } from '@/hooks/useCampaigns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address } = useAccount();
  const { campaigns } = useCampaigns();

  const isCreator = React.useMemo(() => {
    if (!address || !campaigns) return false;
    return campaigns.some(c => c.creator.toLowerCase() === address.toLowerCase());
  }, [address, campaigns]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-fundhub animate-pulse-glow flex items-center justify-center">
            <span className="font-bold text-white">FH</span>
          </div>
          <span className="text-2xl font-bold text-fundhub-dark">
            Fund<span className="text-fundhub-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-6">
            <Link to="/" className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors">
              Home
            </Link>
            <Link to="/campaigns" className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors">
              Campaigns
            </Link>
            <Link to="/create" className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors">
              Start Fundraising
            </Link>

            <Link to="/about" className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors">
              About
            </Link>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-fundhub-primary text-fundhub-primary hover:bg-fundhub-primary/10"
              asChild
            >
              <Link to="/campaigns">
                <Heart className="mr-2 h-4 w-4" /> Donate
              </Link>
            </Button>

            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  authenticationStatus !== 'unauthenticated' &&
                  account &&
                  chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="btn-gradient"
                          >
                            <Wallet className="mr-2 h-5 w-5" />
                            Connect Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            variant="destructive"
                          >
                            Wrong network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex gap-2">
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            className="hidden md:flex items-center gap-1"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-transparent hover:border-fundhub-primary transition-all">
                                <Avatar className="h-full w-full">
                                  {account.ensAvatar && <AvatarImage src={account.ensAvatar} alt={account.displayName} />}
                                  <AvatarFallback className="bg-gradient-to-br from-fundhub-primary to-purple-600 text-white font-bold">
                                    {account.displayName ? account.displayName.substring(0, 2).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                  <p className="text-sm font-medium leading-none">{account.displayName}</p>
                                  <p className="text-xs leading-none text-muted-foreground">
                                    {account.displayBalance ? `${account.displayBalance}` : ''}
                                  </p>
                                </div>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {isCreator && (
                                <DropdownMenuItem asChild>
                                  <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Creator Dashboard</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link to={`/creator/${account.address}`} className="cursor-pointer w-full flex items-center">
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Public Profile</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={openAccountModal} className="cursor-pointer text-red-500 focus:text-red-500 w-full flex items-center">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Wallet Settings</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            <Link
              to="/"
              className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/campaigns"
              className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Campaigns
            </Link>
            <Link
              to="/create"
              className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Start Fundraising
            </Link>

            <Link
              to="/about"
              className="font-medium text-gray-700 hover:text-fundhub-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Button
              variant="outline"
              className="border-fundhub-primary text-fundhub-primary hover:bg-fundhub-primary/10 w-full justify-start"
              asChild
            >
              <Link to="/campaigns">
                <Heart className="mr-2 h-4 w-4" /> Donate
              </Link>
            </Button>

            <div className="w-full">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    authenticationStatus !== 'unauthenticated' &&
                    account &&
                    chain;

                  return (
                    <div
                      style={{ width: '100%' }}
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              className="btn-gradient w-full justify-start"
                            >
                              <Wallet className="mr-2 h-5 w-5" />
                              Connect Wallet
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button
                              onClick={openChainModal}
                              variant="destructive"
                              className="w-full justify-start"
                            >
                              Wrong network
                            </Button>
                          );
                        }

                        return (
                          <Button
                            onClick={openAccountModal}
                            className="bg-green-100 text-green-700 hover:bg-green-200 w-full justify-start"
                          >
                            <span className="flex items-center">
                              {account.displayName}
                            </span>
                          </Button>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
