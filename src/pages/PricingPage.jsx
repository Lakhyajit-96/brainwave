import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI, paymentAPI } from '../lib/api';
import Pricing from '../components/Pricing';
import Section from '../components/Section';
import Button from '../components/Button';

const PricingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
    if (isAuthenticated) {
      fetchCurrentSubscription();
    }
  }, [isAuthenticated]);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await subscriptionAPI.getCurrent();
      setCurrentPlan(response.data.subscription?.plan);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleUpgrade = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (plan.id === 'FREE') {
      try {
        await subscriptionAPI.update('FREE');
        alert('Downgraded to Free plan');
        fetchCurrentSubscription();
      } catch (error) {
        alert('Failed to update subscription');
      }
      return;
    }

    setSelectedPlan(plan);
    setLoading(true);

    try {
      // Create PayPal order
      const orderResponse = await paymentAPI.createOrder({
        plan: plan.id,
        amount: plan.price
      });

      // Redirect to PayPal
      if (orderResponse.data.approvalUrl) {
        window.location.href = orderResponse.data.approvalUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pricing />
      
      <Section className="pt-12">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="h2 mb-8 text-center">Choose Your Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 bg-n-8 border rounded-2xl ${
                    plan.popular
                      ? 'border-color-1 shadow-lg shadow-color-1/20'
                      : 'border-n-6'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gradient-to-r from-color-1 to-color-2 text-white text-xs font-semibold rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}

                  <h3 className="h4 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="h2">${plan.price}</span>
                    <span className="text-n-3">/{plan.interval}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-n-3">
                        <svg
                          className="w-5 h-5 text-color-1 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading || currentPlan === plan.id}
                    className="w-full"
                    white={plan.popular}
                  >
                    {currentPlan === plan.id
                      ? 'Current Plan'
                      : loading && selectedPlan?.id === plan.id
                      ? 'Processing...'
                      : plan.id === 'FREE'
                      ? 'Get Started'
                      : 'Upgrade Now'}
                  </Button>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <h3 className="h3 mb-8 text-center">Frequently Asked Questions</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                <details className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <summary className="cursor-pointer font-semibold text-n-1">
                    Can I change my plan later?
                  </summary>
                  <p className="mt-4 text-n-3">
                    Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </p>
                </details>
                
                <details className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <summary className="cursor-pointer font-semibold text-n-1">
                    What payment methods do you accept?
                  </summary>
                  <p className="mt-4 text-n-3">
                    We accept all major credit cards and PayPal through our secure payment processor.
                  </p>
                </details>
                
                <details className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <summary className="cursor-pointer font-semibold text-n-1">
                    Is there a free trial?
                  </summary>
                  <p className="mt-4 text-n-3">
                    Our Free plan is available forever with no credit card required. You can upgrade anytime to access premium features.
                  </p>
                </details>
                
                <details className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <summary className="cursor-pointer font-semibold text-n-1">
                    Can I cancel my subscription?
                  </summary>
                  <p className="mt-4 text-n-3">
                    Yes, you can cancel your subscription at any time from your dashboard. You'll continue to have access until the end of your billing period.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default PricingPage;
