import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { getItem } from '../data/items';
import { buyItem, sellItem, canAfford, hasInventorySpace } from '../utils/merchant';
import { Icon } from '../components';
import { MERCHANT_AVATARS } from '../data/avatars';

interface MerchantScreenProps {
  shopInventory: string[]; // Item IDs
  buyPrices: Record<string, number>;
  onClose: () => void;
}

export function MerchantScreen({ shopInventory, buyPrices, onClose }: MerchantScreenProps) {
  const { character, setCharacter } = useCharacterStore();
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState<string | null>(null);

  // Randomly select a merchant avatar (consistent per session)
  const [merchantAvatar] = useState(
    () => MERCHANT_AVATARS[Math.floor(Math.random() * MERCHANT_AVATARS.length)]
  );

  if (!character) {
    return <div className="min-h-screen bg-primary text-fg-primary flex items-center justify-center">
      <div className="text-center">
        <Icon name="Info" size={48} className="text-enemy mx-auto mb-4" />
        <p className="body-primary">No character loaded</p>
      </div>
    </div>;
  }

  const handleBuy = (itemId: string) => {
    try {
      const item = getItem(itemId);
      const price = buyPrices[itemId];
      const updatedCharacter = buyItem(character, item, price);
      setCharacter(updatedCharacter);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSell = (itemId: string) => {
    try {
      const updatedCharacter = sellItem(character, itemId);
      setCharacter(updatedCharacter);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const inventoryCount = character.inventory?.length || 0;
  const maxSlots = character.maxInventorySlots || 0;
  const inventoryFull = inventoryCount >= maxSlots;

  // Background image with gradient overlay
  const backgroundStyle = {
    backgroundImage: `
      linear-gradient(to bottom,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.8) 100%
      ),
      url(/assets/locations/card_location_merchant.png)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-fg-primary p-6"
      style={backgroundStyle}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Merchant Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-warning/50 shadow-lg flex-shrink-0">
              <img
                src={`/assets/merchants/${merchantAvatar}`}
                alt="Merchant"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="heading-display text-fg-accent flex items-center gap-3">
              <Icon name="ShoppingBag" size={36} />
              Merchant's Wares
            </h1>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-6 bg-secondary/50 backdrop-blur-sm p-4 rounded-lg border border-warning/30">
            <div className="flex items-center gap-2">
              <Icon name="Coins" size={20} className="text-warning" />
              <span className="body-secondary">Gold:</span>
              <span className="stat-medium text-warning">{character.gold || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Package" size={20} className="text-fg-accent" />
              <span className="body-secondary">Inventory:</span>
              <span className={`stat-medium ${inventoryFull ? 'text-enemy' : 'text-success'}`}>
                {inventoryCount}/{maxSlots}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-secondary/30 p-1 rounded-lg">
          <button
            className={`tab-text flex-1 py-3 px-6 rounded-md transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'buy'
                ? 'bg-success/20 text-success border border-success/50'
                : 'text-fg-secondary hover:bg-secondary/50'
            }`}
            onClick={() => setSelectedTab('buy')}
          >
            <Icon name="ShoppingCart" size={18} />
            <span>Buy Items</span>
          </button>
          <button
            className={`tab-text flex-1 py-3 px-6 rounded-md transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'sell'
                ? 'bg-warning/20 text-warning border border-warning/50'
                : 'text-fg-secondary hover:bg-secondary/50'
            }`}
            onClick={() => setSelectedTab('sell')}
          >
            <Icon name="DollarSign" size={18} />
            <span>Sell Items</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-enemy/20 border-2 border-enemy text-fg-primary p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Icon name="Info" size={20} className="text-enemy flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-enemy mb-1">Transaction Failed</p>
              <p className="body-secondary text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-fg-muted hover:text-fg-primary transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        )}

        {/* Buy Tab */}
        {selectedTab === 'buy' && (
          <div>
            {shopInventory.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg border border-border-default">
                <Icon name="Package" size={48} className="text-fg-muted mx-auto mb-3" />
                <p className="body-secondary">The merchant has no items for sale.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
              {shopInventory.map((itemId) => {
                const item = getItem(itemId);
                const price = buyPrices[itemId];
                const affordable = canAfford(character, price);
                const hasSpace = hasInventorySpace(character);
                const canBuy = affordable && hasSpace;

                return (
                  <div
                    key={itemId}
                    className={`bg-gradient-to-br from-secondary to-secondary/50 p-3 rounded-lg border-2 transition-all ${
                      canBuy
                        ? 'border-success/30 hover:border-success/60 hover:shadow-lg hover:shadow-success/10'
                        : 'border-border-default/50 opacity-75'
                    }`}
                  >
                    {/* Item Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                      canBuy ? 'bg-success/20 border border-success/30' : 'bg-secondary border border-border-default'
                    }`}>
                      <Icon name="Gem" size={24} className={canBuy ? 'text-success' : 'text-fg-muted'} />
                    </div>

                    {/* Item Details */}
                    <h3 className="heading-tertiary text-fg-accent mb-1 text-base">{item.name}</h3>
                    <p className="body-secondary text-xs text-fg-muted mb-2 line-clamp-2">{item.description}</p>

                    {/* Price */}
                    <div className="flex items-center gap-1 mb-2">
                      <Icon name="Coins" size={14} className="text-warning" />
                      <span className="stat-small text-warning text-base">{price}</span>
                      <span className="body-secondary text-xs text-fg-muted">gold</span>
                    </div>

                    {/* Status Message */}
                    {!canBuy && (
                      <div className="flex items-center gap-1 text-enemy mb-2">
                        <Icon name="Info" size={12} />
                        <span className="text-xs">
                          {!affordable ? 'Not enough gold' : 'Inventory full'}
                        </span>
                      </div>
                    )}

                    {/* Buy Button */}
                    <button
                      className={`button-text w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        canBuy
                          ? 'bg-gradient-to-br from-success to-success/80 text-white hover:from-success/90 hover:to-success/70 active:scale-95'
                          : 'bg-secondary border border-border-default text-fg-muted cursor-not-allowed'
                      }`}
                      onClick={() => handleBuy(itemId)}
                      disabled={!canBuy}
                    >
                      <Icon name="ShoppingCart" size={16} />
                      <span>Buy</span>
                    </button>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* Sell Tab */}
        {selectedTab === 'sell' && (
          <div>
            {(character.inventory || []).length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg border border-border-default">
                <Icon name="PackageOpen" size={48} className="text-fg-muted mx-auto mb-3" />
                <p className="body-secondary">Your inventory is empty.</p>
                <p className="body-secondary text-sm text-fg-muted mt-2">
                  Buy some items to sell them later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
              {(character.inventory || []).map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-secondary to-secondary/50 p-3 rounded-lg border-2 border-warning/30 hover:border-warning/60 transition-all hover:shadow-lg hover:shadow-warning/10"
                >
                  {/* Item Icon */}
                  <div className="w-12 h-12 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-center mb-2">
                    <Icon name="Package" size={24} className="text-warning" />
                  </div>

                  {/* Item Details */}
                  <h3 className="heading-tertiary text-fg-accent mb-1 text-base">{item.name}</h3>
                  <p className="body-secondary text-xs text-fg-muted mb-2 line-clamp-2">{item.description}</p>

                  {/* Sell Price */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="body-secondary text-xs text-fg-muted">Sell for</span>
                    <Icon name="Coins" size={14} className="text-warning" />
                    <span className="stat-small text-warning text-base">{item.value}</span>
                    <span className="body-secondary text-xs text-fg-muted">gold</span>
                  </div>

                  {/* Sell Button */}
                  <button
                    className="button-text w-full px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-warning to-warning/80 text-white hover:from-warning/90 hover:to-warning/70 transition-all active:scale-95 flex items-center justify-center gap-2"
                    onClick={() => handleSell(item.id)}
                  >
                    <Icon name="DollarSign" size={16} />
                    <span>Sell</span>
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          className="button-text mt-8 px-8 py-4 rounded-lg w-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 text-fg-primary hover:from-slate-600 hover:to-slate-700 hover:border-slate-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          onClick={onClose}
        >
          <Icon name="X" size={20} />
          <span>Leave Merchant</span>
        </button>
      </div>
    </div>
  );
}