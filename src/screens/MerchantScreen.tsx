import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { getItem } from '../data/items';
import { buyItem, sellItem, canAfford, hasInventorySpace } from '../utils/merchant';

interface MerchantScreenProps {
  shopInventory: string[]; // Item IDs
  buyPrices: Record<string, number>;
  onClose: () => void;
}

export function MerchantScreen({ shopInventory, buyPrices, onClose }: MerchantScreenProps) {
  const { character, setCharacter } = useCharacterStore();
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState<string | null>(null);

  if (!character) {
    return <div className="body-primary">No character loaded</div>;
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

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-primary text-text-accent mb-2">Merchant's Wares</h1>
        <p className="body-secondary mb-6">
          Gold: <span className="stat-medium text-gold">{character.gold || 0}</span>
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            className={`tab-text pb-2 px-4 ${
              selectedTab === 'buy'
                ? 'border-b-2 border-text-accent text-text-accent'
                : 'text-text-secondary'
            }`}
            onClick={() => setSelectedTab('buy')}
          >
            Buy
          </button>
          <button
            className={`tab-text pb-2 px-4 ${
              selectedTab === 'sell'
                ? 'border-b-2 border-text-accent text-text-accent'
                : 'text-text-secondary'
            }`}
            onClick={() => setSelectedTab('sell')}
          >
            Sell
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Buy Tab */}
        {selectedTab === 'buy' && (
          <div className="space-y-4">
            {shopInventory.map((itemId) => {
              const item = getItem(itemId);
              const price = buyPrices[itemId];
              const affordable = canAfford(character, price);
              const hasSpace = hasInventorySpace(character);

              return (
                <div
                  key={itemId}
                  className="bg-secondary p-4 rounded-lg border border-border flex justify-between items-center"
                >
                  <div>
                    <h3 className="heading-tertiary">{item.name}</h3>
                    <p className="body-secondary text-sm">{item.description}</p>
                    <p className="stat-small text-gold mt-2">{price} gold</p>
                  </div>
                  <button
                    className={`button-text px-6 py-2 rounded ${
                      affordable && hasSpace
                        ? 'bg-accent text-fg-inverted hover:bg-accent-hover'
                        : 'bg-muted text-text-muted cursor-not-allowed'
                    }`}
                    onClick={() => handleBuy(itemId)}
                    disabled={!affordable || !hasSpace}
                  >
                    Buy
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Sell Tab */}
        {selectedTab === 'sell' && (
          <div className="space-y-4">
            {(character.inventory || []).length === 0 ? (
              <p className="body-secondary text-center py-8">
                You have no items to sell.
              </p>
            ) : (
              (character.inventory || []).map((item) => (
                <div
                  key={item.id}
                  className="bg-secondary p-4 rounded-lg border border-border flex justify-between items-center"
                >
                  <div>
                    <h3 className="heading-tertiary">{item.name}</h3>
                    <p className="body-secondary text-sm">{item.description}</p>
                    <p className="stat-small text-gold mt-2">Sell for {item.value} gold</p>
                  </div>
                  <button
                    className="button-text px-6 py-2 rounded bg-accent text-fg-inverted hover:bg-accent-hover"
                    onClick={() => handleSell(item.id)}
                  >
                    Sell
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          className="button-text mt-8 px-8 py-3 rounded bg-border text-text-primary hover:bg-border-hover w-full"
          onClick={onClose}
        >
          Leave Merchant
        </button>
      </div>
    </div>
  );
}