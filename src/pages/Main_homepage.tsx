import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  FaPause, FaCalendarPlus } from 'react-icons/fa'; // cart icon FaShoppingCart,


import { MdLocationOn } from 'react-icons/md';
import { motion } from 'framer-motion';
import logo from '../assets/All/logo.png';
import { walletService } from '../services/wallet.service';
import { basePackService, BasePack } from '../services/basepack.service';
import { subscriptionService, Subscription } from '../services/subscription.service';
import ErrorBoundary from '../components/ErrorBoundary';
import useGoogleMaps from '../hooks/useGoogleMaps';
import { productService } from '../services/product.service';
import type { Product as ProductType } from '../services/product.service';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import Spinner from '../components/common/Spinner';
import lowBalance from '../assets/icon/LowBalance.png';
import WalletIcon from '../assets/icon/Wallet.png'
import searchImage from '../assets/icon/Search.png'
import ProfileIcon from '../assets/icon/Profile.png'
import BottomNavigation from './../components/layout/BottomNav';


interface DayInfo {
  date: string;
  day: string;
  status: 'past' | 'active' | 'future';
  deliveryStatus?: 'pending' | 'delivered' | 'next';
}

// Static fallback data for BasePacks (at least 5 items)
const staticFallbackBasePacks: BasePack[] = [
  {
    id: 'fallback-basepack-1',
    name: 'Static Basic Pack',
    description: 'A static selection of puja flowers.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPricePerPackDaily: 50,
    sellingPricePerPackAlternate: 45,
    type: 'BASEPACK',
    contents: [{ id: 'rose-fb', name: 'Static Rose', quantity: 5 }],
  },
  {
    id: 'fallback-basepack-2',
    name: 'Static Medium Pack',
    description: 'A static mix for daily prayers.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPricePerPackDaily: 80,
    sellingPricePerPackAlternate: 75,
    type: 'BASEPACK',
    contents: [{ id: 'marigold-fb', name: 'Static Marigold', quantity: 10 }],
  },
  {
    id: 'fallback-basepack-3',
    name: 'Static Large Pack',
    description: 'A large static pack for special occasions.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPricePerPackDaily: 120,
    sellingPricePerPackAlternate: 110,
    type: 'BASEPACK',
    contents: [{ id: 'lily-fb', name: 'Static Lily', quantity: 8 }],
  },
  {
    id: 'fallback-basepack-4',
    name: 'Static Economy Pack',
    description: 'An affordable static daily pack.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPricePerPackDaily: 30,
    sellingPricePerPackAlternate: 25,
    type: 'BASEPACK',
    contents: [{ id: 'mixed-fb', name: 'Static Mixed Flowers', quantity: 15 }],
  },
  {
    id: 'fallback-basepack-5',
    name: 'Static Premium Pack',
    description: 'High-quality static flowers.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPricePerPackDaily: 150,
    sellingPricePerPackAlternate: 140,
    type: 'BASEPACK',
    contents: [{ id: 'orchid-fb', name: 'Static Orchid', quantity: 3 }],
  },
];

// Static fallback data for Products (at least 5 of each relevant type: Flowers, Leaves, Garlands)
const staticFallbackProducts: ProductType[] = [
  {
    id: 'fallback-flower-1',
    name: 'Static Red Rose',
    description: 'Vibrant static red roses.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 15,
    type: 'FLOWERS',
    allowedSubscriptionType: 'daily',
    tags: ['rose', 'red'],
    weight: 10,
    isAvailable: true,
  },
  {
    id: 'fallback-flower-2',
    name: 'Static White Lily',
    description: 'Elegant static white lilies.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 20,
    type: 'FLOWERS',
    allowedSubscriptionType: 'daily',
    tags: ['lily', 'white'],
    weight: 12,
    isAvailable: true,
  },
  {
    id: 'fallback-flower-3',
    name: 'Static Mixed Bouquet',
    description: 'A static bouquet of mixed seasonal flowers.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 25,
    type: 'FLOWERS',
    allowedSubscriptionType: 'weekly',
    tags: ['mixed', 'seasonal'],
    weight: 18,
    isAvailable: true,
  },
  {
    id: 'fallback-flower-4',
    name: 'Static Sunflowers',
    description: 'Bright static sunflowers.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 30,
    type: 'FLOWERS',
    allowedSubscriptionType: 'weekly',
    tags: ['sunflower'],
    weight: 20,
    isAvailable: true,
  },
  {
    id: 'fallback-flower-5',
    name: 'Static Carnations',
    description: 'Colourful static carnations.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 10,
    type: 'FLOWERS',
    allowedSubscriptionType: 'daily',
    tags: ['carnation'],
    weight: 8,
    isAvailable: true,
  },
  {
    id: 'fallback-leaf-1',
    name: 'Static Tulsi Leaves',
    description: 'Fresh static holy basil leaves.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 5,
    type: 'LEAVES',
    allowedSubscriptionType: 'daily',
    tags: ['tulsi', 'herbal'],
    weight: 5,
    isAvailable: true,
  },
  {
    id: 'fallback-leaf-2',
    name: 'Static Curry Leaves',
    description: 'Aromatic static curry leaves.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 3,
    type: 'LEAVES',
    allowedSubscriptionType: 'daily',
    tags: ['curry', 'herbal'],
    weight: 3,
    isAvailable: true,
  },
  {
    id: 'fallback-leaf-3',
    name: 'Static Neem Leaves',
    description: 'Static neem leaves for medicinal use.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 4,
    type: 'LEAVES',
    allowedSubscriptionType: 'daily',
    tags: ['neem', 'herbal'],
    weight: 4,
    isAvailable: true,
  },
  {
    id: 'fallback-leaf-4',
    name: 'Static Mint Leaves',
    description: 'Refreshing static mint leaves.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 2,
    type: 'LEAVES',
    allowedSubscriptionType: 'daily',
    tags: ['mint', 'herbal'],
    weight: 2,
    isAvailable: true,
  },
  {
    id: 'fallback-leaf-5',
    name: 'Static Betel Leaves',
    description: 'Static betel leaves for puja.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 6,
    type: 'LEAVES',
    allowedSubscriptionType: 'daily',
    tags: ['betel', 'puja'],
    weight: 6,
    isAvailable: true,
  },
  {
    id: 'fallback-garland-1',
    name: 'Static Marigold Garland',
    description: 'A static garland of marigolds.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 60,
    type: 'GARLAND',
    allowedSubscriptionType: 'weekly',
    tags: ['marigold', 'garland'],
    weight: 100,
    isAvailable: true,
  },
  {
    id: 'fallback-garland-2',
    name: 'Static Jasmine Garland',
    description: 'A fragrant static jasmine garland.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 80,
    type: 'GARLAND',
    allowedSubscriptionType: 'weekly',
    tags: ['jasmine', 'garland'],
    weight: 120,
    isAvailable: true,
  },
  {
    id: 'fallback-garland-3',
    name: 'Static Mixed Flower Garland',
    description: 'A static garland of mixed flowers.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 70,
    type: 'GARLAND',
    allowedSubscriptionType: 'weekly',
    tags: ['mixed', 'garland'],
    weight: 110,
    isAvailable: true,
  },
  {
    id: 'fallback-garland-4',
    name: 'Static Tuberose Garland',
    description: 'A static tuberose garland.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 90,
    type: 'GARLAND',
    allowedSubscriptionType: 'weekly',
    tags: ['tuberose', 'garland'],
    weight: 130,
    isAvailable: true,
  },
  {
    id: 'fallback-garland-5',
    name: 'Static Daisy Garland',
    description: 'A static daisy garland.',
    imageUrl: 'https://via.placeholder.com/160',
    sellingPrice: 55,
    type: 'GARLAND',
    allowedSubscriptionType: 'weekly',
    tags: ['daisy', 'garland'],
    weight: 90,
    isAvailable: true,
  },
];

// Static fallback data for subscriptions
const staticFallbackSubscriptions: Subscription[] = [
  {
    id: 'fallback-sub-1',
    customerId: 'fallback-user',
    basePackId: 'fallback-basepack-1',
    basePackDetails: {
      name: 'Static Puja Pack',
      description: 'A basic puja flower pack.',
      imageUrl: 'https://via.placeholder.com/160',
      contents: [],
    },
    startDate: new Date(),
    status: 'ACTIVE',
    type: 'DAILY',
    selectedDays: [],
    createdAt: new Date(),
  },
];

const Home2: React.FC = () => {
  const navigate = useNavigate();
  const [, setDays] = useState<DayInfo[]>([]);
  const [deliveryLocation] = useState<string>(() => localStorage.getItem('userLocation') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [, setIsLoadingBalance] = useState(true);
  const [basePacks, setBasePacks] = useState<BasePack[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const userName = localStorage.getItem('userName') || 'User';
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);

  useGoogleMaps();

  const fetchWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const balance = await walletService.getWalletBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoadingSubscriptions(true);
      const fetchedSubscriptions = await subscriptionService.getCustomerSubscriptions();

      if (fetchedSubscriptions && fetchedSubscriptions.length > 0) {
        // Find active subscription
        const active = fetchedSubscriptions.find(sub => sub.status === 'ACTIVE');
        setActiveSubscriptions(fetchedSubscriptions);
        setSelectedSubscription(active || null);
      } else {
        console.warn('API returned no subscriptions, using static fallback.');
        setActiveSubscriptions(staticFallbackSubscriptions);
        setSelectedSubscription(staticFallbackSubscriptions[0] || null); // Select the first static subscription
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions, using static fallback:', error);
      setActiveSubscriptions(staticFallbackSubscriptions);
      setSelectedSubscription(staticFallbackSubscriptions[0] || null); // Select the first static subscription
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const fetchActiveSubscriptions = async () => {
    try {
      setIsLoadingSubscriptions(true);
      const subscriptions = await subscriptionService.getCustomerSubscriptions();
      const active = subscriptions.filter(sub => sub.status === 'ACTIVE');
      
      if (active.length > 0) {
        setActiveSubscriptions(active);
        setSelectedSubscription(active[0]);
      } else {
        console.warn('No active subscriptions from API, using static fallback.');
        setActiveSubscriptions(staticFallbackSubscriptions);
        setSelectedSubscription(staticFallbackSubscriptions[0] || null); // Select the first static static subscription
      }
    } catch (error) {
      console.error('Error fetching active subscriptions, using static fallback:', error);
      setActiveSubscriptions(staticFallbackSubscriptions);
      setSelectedSubscription(staticFallbackSubscriptions[0] || null); // Select the first static static subscription
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const fetchBasePacks = async () => {
    try {
      setIsLoadingPacks(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { returnUrl: location.pathname } });
        // Set static data immediately if not logged in to show something
        setBasePacks(staticFallbackBasePacks);
        return;
      }

      const packs = await basePackService.getAllBasePacks();
      if (packs && packs.length > 0) {
      setBasePacks(packs);
      } else {
        console.warn('API returned no base packs, using static fallback.');
        setBasePacks(staticFallbackBasePacks);
      }
    } catch (error: any) {
      console.error('Error fetching base packs, using static fallback:', error);
      if (error.message === 'Authentication required' || error.message.includes('Session expired')) {
        navigate('/login', { state: { returnUrl: location.pathname } });
      } else {
        setError(error.message || 'Failed to load base packs. Displaying static data.');
        // On API error, use static fallback data
        setBasePacks(staticFallbackBasePacks);
      }
    } finally {
      setIsLoadingPacks(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const fetchedProducts = await productService.getAllProducts();


      // Normalize product types to uppercase for consistent comparison
      const normalizedProducts = fetchedProducts.map(product => ({
        ...product,
        type: product.type.toUpperCase()
      }));

      if (normalizedProducts && normalizedProducts.length > 0) {
      setProducts(normalizedProducts);
      } else {
        console.warn('API returned no products, using static fallback.');
        setProducts(staticFallbackProducts);
      }

    } catch (error) {
      console.error('Error fetching products, using static fallback:', error);
      // On API error, use static fallback data
      setProducts(staticFallbackProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchNextDelivery = async () => {
    // Fetch next delivery details from the backend
    // This is a placeholder function, replace with actual API call
    return {
      date: 'Tuesday, 28 May',
      packs: ['Brahma Pack', 'Rudra Pack'],
    };
  };

  useEffect(() => {
    const needLocation = localStorage.getItem('needLocation') === 'true';
    if (needLocation) {
      localStorage.removeItem('needLocation');
    }

    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetchWalletBalance();
      fetchSubscriptions();
      fetchActiveSubscriptions();
    }

    fetchBasePacks();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (deliveryLocation) {
      localStorage.setItem('userLocation', deliveryLocation);
    }
  }, [deliveryLocation]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchActiveSubscriptions();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const nextSevenDays: DayInfo[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Determine delivery status based on active subscription
      let deliveryStatus: 'pending' | 'delivered' | 'next' | undefined = undefined;

      if (selectedSubscription) {
        const subscriptionStartDate = new Date(selectedSubscription.startDate);
        const currentDate = new Date(date);

        // Reset time part for accurate date comparison
        currentDate.setHours(0, 0, 0, 0);
        subscriptionStartDate.setHours(0, 0, 0, 0);

        if (currentDate < subscriptionStartDate) {
          // Before subscription start date
          deliveryStatus = undefined;
        } else if (currentDate.getTime() === subscriptionStartDate.getTime()) {
          // On subscription start date
          deliveryStatus = 'next';
        } else if (currentDate < new Date()) {
          // Past dates
          deliveryStatus = 'delivered';
        } else {
          // Future dates
          deliveryStatus = 'pending';
        }
      }

      return {
        date: date.getDate().toString().padStart(2, '0'),
        day: weekdays[date.getDay()],
        status: i === 0 ? 'active' : i < 0 ? 'past' : 'future',
        deliveryStatus
      };
    });
    setDays(nextSevenDays);
  }, [selectedSubscription]);

  useEffect(() => {
    fetchNextDelivery().then((delivery) => {
      // Update state with fetched delivery details
      // This is a placeholder, replace with actual state update
      console.log(delivery);
    });
  }, []);

  const handleProductClick = (product: ProductType) => {
    navigate(`/product/${product.id}`);
  };


  const handlePause = async () => {
    if (!selectedSubscription || !customStartDate) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resumeDate = new Date(customStartDate);
      resumeDate.setHours(0, 0, 0, 0);
      
      const diffTime = resumeDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        toast.error('Resume date must be at least 1 day from today');
        return;
      }

      const response = await subscriptionService.pauseSubscription(
        selectedSubscription.id,
        diffDays
      );

      if (response.success) {
        setShowPauseModal(false);
        fetchActiveSubscriptions();
        toast.success('Subscription paused successfully');
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast.error('Failed to pause subscription');
    }
  };


  const handleAddToNextDelivery = () => {
    navigate('/products?category=basepacks');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FFFBEB] pb-20 lg:pb-0">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <header className="p-2 sm:p-4 md:p-6 bg-[#FFFBEB] z-50 w-full">
            <div className="flex items-center justify-between w-full max-w-[800px] mx-auto">
              <div className="flex-1 min-w-0">
                {/* Location section */}
                <motion.div
                  className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/location')}
                >
                  <MdLocationOn className="text-[#015D3A] text-lg sm:text-xl mt-2 sm:mt-4" />
                  <span className="text-[#64748B] text-base sm:text-lg mt-2 sm:mt-4">Delivering to Home</span>
                </motion.div>
                <div className="text-[#64748B] text-xs sm:text-sm ml-4 sm:ml-5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] xs:max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                  {deliveryLocation
                    ? `${deliveryLocation.substring(0, 25)}${deliveryLocation.length > 25 ? '' : ''}`
                    : 'B-149, Shilp Residency, Tarsali'}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src={searchImage} 
                  alt="search" 
                  className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                  onClick={() => navigate('/search')}
                />
                <button
                  onClick={() => navigate('/wallet')}
                  className="flex items-center"
                >
                  <img src={WalletIcon} alt="Wallet" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                  <span className="text-[#015D3A] text-lg sm:text-xl">₹{walletBalance}</span>
                </button>

                <button
                  onClick={() => navigate('/account')}
                  className="flex items-center justify-center"
                >
                  <img src={ProfileIcon} alt="Profile" className="w-8 h-8 sm:w-4 sm:h-4 md:w-10 md:h-10" />
                </button>
              </div>
            </div>
          </header>

          {/* Greeting Section */}
          <div className="px-4 md:px-6 py-6">
            <h1 className="text-2xl md:text-3xl ml-4 font-bold text-gray-800">Namaste, {userName} 🌸</h1>
            <p className="text-sm md:text-base ml-4 text-gray-600">May your day be blessed!</p>
          </div>

          {/* Alert and Promo Banner Container */}
          <div className="grid grid-cols-1 gap-4 px-4 md:px-6 mb-6">
            {/* Low Balance Alert */}
            {walletBalance < 100 && (
              <div className="bg-orange-100 rounded-xl p-7 mb-7 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="rounded-full w-8 h-8">
                      <img src={lowBalance} alt='' className='w-full h-full' />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-orange-800 font-semibold">Low Balance Alert</h3>
                    <p className="text-orange-600 text-sm">Your wallet balance is running low</p>
                  </div>
                </div>
                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-2xl text-sm"
                    onClick={() => navigate('/wallet')}
                  >
                    Recharge Now
                  </motion.button>
                </div>
              </div>
            )}

            {/* Promo Banner Card */}
            <div className="bg-white rounded-xl p-7  shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Promo Banner</h3>
                  <p className="text-gray-600">Premium Lotus & Rose Combo</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-800">₹399</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full">Icon</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery and Wisdom Container */}
          <div className="grid grid-cols-1 gap-4 px-4 md:px-6 mb-6">
            {/* Next Delivery Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-500">YOUR NEXT DELIVERY</h3>
                <button 
                  className="text-[#006D3B] text-sm font-medium" 
                  onClick={() => navigate('/manage-my-subscription')}
                >
                  Manage
                </button>
              </div>

              {isLoadingSubscriptions ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner size={40} />
                </div>
              ) : activeSubscriptions.length > 0 ? (
                <>
                  <p className="text-lg font-bold text-gray-800 mb-3">
                    Tomorrow, {new Date().toLocaleString('default', { month: 'short' })} {new Date().getDate() + 1}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeSubscriptions.map(subscription => (
                      <span 
                        key={subscription.id}
                        className="bg-[#DCFCE7] text-[#166534] text-xs px-3 py-1 rounded-full"
                      >
                        {subscription.basePackDetails?.name || 'Subscription Pack'}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedSubscription(activeSubscriptions[0]);
                        setShowPauseModal(true);
                      }}
                      className="text-[#FF5722] text-sm font-medium flex items-center border border-[#FF5722] rounded-full px-4 py-2"
                    >
                      <FaPause className="mr-2" /> Pause
                    </button>
                    <button 
                      onClick={handleAddToNextDelivery}
                      className="text-[#006D3B] text-sm font-medium flex items-center border border-[#006D3B] rounded-full px-4 py-2"
                    >
                      <FaCalendarPlus className="mr-2" /> Add to next delivery
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No active subscriptions</p>
                  <button
                    onClick={() => navigate('/products?category=basepacks')}
                    className="text-[#006D3B] text-sm font-medium border border-[#006D3B] rounded-full px-6 py-2"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>

            {/* Today's Flower Wisdom Card */}
            <div className="bg-white rounded-xl p-7 shadow-sm">
              <h3 className="text-lg text-[#8B4513] mb-4">Today's Flower Wisdom</h3>
              <div className="space-y-4">
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  "Like the lotus flower that grows out of the mud and blossoms above the muddy water surface,
                  we too can rise above our defilements."
                </p>
                <p className="text-gray-500">— Buddhist Teaching</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 md:px-6">
            {/* Base Packs Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Base Packs</h2>
                <button className="text-green-600 text-sm md:text-base font-medium" onClick={() => navigate('/products?category=basepacks')}>
                  View All
                </button>
              </div>

              {isLoadingPacks ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner size={400} />
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                   {/* Show message if no packs and no error, otherwise map packs */}
                   {!error && basePacks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 w-full">No base packs available at the moment</div>
                  ) : (
                    basePacks.map(pack => (
                    <div
                      key={pack.id}
                        className="flex-shrink-0 w-[160px] h-[280px] bg-white rounded-3xl shadow-sm overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(pack as unknown as ProductType)}
                    >
                      <div className="p-3">
                        <div className="bg-[#FFFBEB] rounded-2xl overflow-hidden aspect-square">
                          <img
                            src={pack.imageUrl || 'https://via.placeholder.com/160'}
                            alt={pack.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="pt-3 pb-2 px-1 space-y-2">
                          <h3 className="text-[16px] font-semibold text-gray-900 truncate">{pack.name}</h3>
                          <p className="text-[14px] text-gray-500 truncate">{pack.description}</p>
                          <p className="text-pink-600 text-[16px] font-bold">₹{pack.sellingPricePerPackDaily}/Day</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(pack as unknown as ProductType);
                            }}
                            className="text-green-600 text-[16px] mb-3 font-medium block"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Flowers Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Flowers</h2>
                <button className="text-green-600 text-sm font-medium" onClick={() => navigate('/products?category=flowers')}>
                  View All
                </button>
              </div>
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner size={400} />
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                   {/* Show message if no flowers and no error, otherwise map flowers */}
                   {!error && products.filter(item => item.type === 'FLOWERS').length === 0 ? (
                    <div className="text-center py-8 text-gray-500 w-full">No flowers available at the moment</div>
                  ) : (
                    products
                    .filter(item => item.type === 'FLOWERS' && item.isAvailable)
                    .map(item => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-[160px] h-[280px] bg-white rounded-3xl shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => handleProductClick(item)}
                      >
                        <div className="p-3">
                          <div className="bg-[#FFFBEB] rounded-2xl overflow-hidden aspect-square">
                            <img
                              src={item.imageUrl || 'https://via.placeholder.com/160'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="pt-3 pb-2 px-1 space-y-2">
                            <h3 className="text-[16px] font-semibold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-[14px] text-gray-500 truncate">{item.description}</p>
                            <p className="text-pink-600 text-[16px] font-bold">₹{item.sellingPrice}/Day</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(item);
                              }}
                              className="text-green-600 text-[16px] mb-3 font-medium block"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Leaves Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Leaves</h2>
                <button className="text-green-600 text-sm font-medium" onClick={() => navigate('/products?category=leaves')}>
                  View All
                </button>
              </div>
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner size={400} />
                </div>
              ) : products.filter(item => item.type === 'LEAVES').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leaves available at the moment
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                  {products
                    .filter(item => item.type === 'LEAVES' && item.isAvailable)
                    .map(item => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-[160px] h-[280px] bg-white rounded-3xl shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => handleProductClick(item)}
                      >
                        <div className="p-3">
                          <div className="bg-[#FFFBEB] rounded-2xl overflow-hidden aspect-square">
                            <img
                              src={item.imageUrl || 'https://via.placeholder.com/160'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="pt-3 pb-2 px-1 space-y-2">
                            <h3 className="text-[16px] font-semibold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-[14px] text-gray-500 truncate">{item.description}</p>
                            <p className="text-pink-600 text-[16px] font-bold">₹{item.sellingPrice}/Day</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(item);
                              }}
                              className="text-green-600 text-[16px] mb-3 font-medium block"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Garlands Section */}
            <div className="mb-8 md:mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Garlands</h2>
                <button className="text-green-600 text-sm font-medium" onClick={() => navigate('/products?category=garlands')}>
                  View All
                </button>
              </div>
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-40">
                    <Spinner size={400} />
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                   {/* Show message if no garlands and no error, otherwise map garlands */}
                   {!error && products.filter(item => item.type === 'GARLAND').length === 0 ? (
                    <div className="text-center py-8 text-gray-500 w-full">No garlands available at the moment</div>
                  ) : (
                    products
                    .filter(item => item.type === 'GARLAND' && item.isAvailable)
                    .map(item => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-[160px] h-[280px] bg-white rounded-3xl shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => handleProductClick(item)}
                      >
                        <div className="p-3">
                          <div className="bg-[#FFFBEB] rounded-2xl overflow-hidden aspect-square">
                            <img
                              src={item.imageUrl || 'https://via.placeholder.com/160'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="pt-3 pb-2 px-1 space-y-2">
                            <h3 className="text-[16px] font-semibold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-[14px] text-gray-500 truncate">{item.description}</p>
                            <p className="text-pink-600 text-[16px] font-bold">₹{item.sellingPrice}/Day</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(item);
                              }}
                              className="text-green-600 text-[16px] mb-3 font-medium block"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Hide on desktop */}
        <div className='mb-10 md:mb-10'>
          <BottomNavigation />
        </div>

         {/* Logo */}
         <div className='flex justify-center items-center max-w-[800px] mx-auto'>
          <img src={logo} alt='logo' className='w-32 h-32 opacity-0' />
         </div>

         {/* Pause Modal */}
         {showPauseModal && selectedSubscription && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl w-full max-w-md">
               <div className="p-4">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-medium">Pause Subscription</h2>
                   <button 
                     onClick={() => setShowPauseModal(false)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     ✕
                   </button>
                 </div>

                 <div className="mb-6">
                   <label className="block text-gray-700 mb-2">Resume delivery from</label>
                   <DatePicker
                     selected={customStartDate}
                     onChange={(date) => setCustomStartDate(date)}
                     minDate={new Date()}
                     placeholderText="mm/dd/yyyy"
                     className="w-full p-3 border border-gray-300 rounded-lg"
                   />
                 </div>

                 <div className="bg-gray-50 p-4 rounded-lg mb-6">
                   <h3 className="font-medium mb-3">What happens when you pause?</h3>
                   <ul className="space-y-2 text-sm text-gray-600">
                     <li>• Your subscription will be paused immediately</li>
                     <li>• No deliveries will be made until the resume date</li>
                     <li>• You won't be charged during the pause period</li>
                     <li>• Your subscription will automatically resume on the selected date</li>
                   </ul>
                 </div>

                 <div className="flex gap-3">
                   <button
                     onClick={() => setShowPauseModal(false)}
                     className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-medium"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handlePause}
                     className="flex-1 py-3 rounded-xl bg-[#FF5722] text-white font-medium"
                     disabled={!customStartDate}
                   >
                     Confirm
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}
      </div>
    </ErrorBoundary>
  );
};

export default Home2;
