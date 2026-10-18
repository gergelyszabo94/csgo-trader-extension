import React, { useState, useEffect } from 'react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

import { currencies } from 'utils/static/pricing';
import { setCustomPrice, removeCustomPrice, clearCustomPrices } from 'utils/pricing';

const CustomPrices = () => {
  const [customPrices, setCustomPrices] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    chrome.storage.local.get(['customItemPrices', 'currency', 'exchangeRate'], (result) => {
      setCustomPrices(result.customItemPrices || {});
      setCurrency(result.currency);
      setExchangeRate(result.exchangeRate);
    });

    const listener = (changes, areaName) => {
      if (areaName !== 'local') return;
      if (changes.customItemPrices) setCustomPrices(changes.customItemPrices.newValue || {});
      if (changes.currency) setCurrency(changes.currency.newValue);
      if (changes.exchangeRate) setExchangeRate(changes.exchangeRate.newValue);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const entries = Object.entries(customPrices);
  const sign = currencies[currency] ? currencies[currency].sign : '';

  const save = (assetID, entry) => {
    const value = parseFloat(String(edits[assetID]).replace(',', '.'));
    if (!Number.isFinite(value) || value < 0 || !exchangeRate) return;
    setCustomPrice(assetID, value / exchangeRate, entry.marketHashName, entry.name).then(() => {
      setEdits((current) => {
        const { [assetID]: removed, ...rest } = current;
        return rest;
      });
    });
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <h3>Custom item prices</h3>
      <p>
        Prices you set for your own items in your inventory. They override the pricing provider
        for those exact items (by asset ID) and are only visible to you.
        Set them by selecting an item in your inventory.
      </p>
      {entries.length === 0 ? <p>No custom prices set.</p> : (
        <>
          <table style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
            <thead>
              <tr>
                <th style={{ paddingRight: '40px' }}>Item</th>
                <th style={{ paddingRight: '40px' }}>Asset ID</th>
                <th style={{ paddingRight: '40px' }}>{`Price (${currency})`}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([assetID, entry]) => (
                <tr key={assetID}>
                  <td style={{ paddingRight: '40px' }}>{entry.marketHashName || entry.name}</td>
                  <td style={{ paddingRight: '40px' }}>{assetID}</td>
                  <td style={{ paddingRight: '40px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="text"
                        className="input"
                        style={{ width: '90px' }}
                        value={edits[assetID] !== undefined
                          ? edits[assetID]
                          : (entry.usdPrice * exchangeRate).toFixed(2)}
                        onChange={(event) => setEdits({ ...edits, [assetID]: event.target.value })}
                      />
                      <span>{sign}</span>
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {edits[assetID] !== undefined && (
                      <button
                        type="button"
                        className="button button__save"
                        onClick={() => save(assetID, entry)}
                      >
                        Edit price
                      </button>
                    )}
                    <CustomA11yButton action={() => removeCustomPrice(assetID)} title="Delete custom price">
                      <FontAwesomeIcon icon={faTrash} className="delete" />
                    </CustomA11yButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="button button__save" onClick={() => clearCustomPrices()}>
            Clear all
          </button>
        </>
      )}
    </div>
  );
};

export default CustomPrices;
