const rawOi = t.oi ?? t.open_interest ?? t.oi_contracts ?? 0;
      const oi = typeof rawOi === 'string' ? parseFloat(rawOi) || 0 : Number(rawOi) || 0;
      
      // FIX: Ensure Delta's USD notional or contract values align properly
      const contractValue = parseFloat(item.contract_value) || 1;
      const markPrice = parseFloat(t.mark_price ?? t.close ?? t.ltp ?? 0);
      
      // Delta provides oi_value_usd or we compute it using OI * markPrice * contractValue (or strike)
      const notional = parseFloat(t.oi_value_usd ?? t.notional_value ?? 0) || (oi * markPrice * contractValue);
      
      // Fix OI Change fields to properly capture Delta's 24h metrics without arbitrary multipliers distorting exits
      const oiChange = parseFloat(t.oi_change_usd_24h ?? t.oi_change_24h ?? 0);
      const oiChangePct = parseFloat(t.oi_change_24h_percent ?? t.oi_change_percentage ?? 0);
      const volume = parseFloat(t.volume ?? t.volume_24h ?? t.turnover ?? 0);
      const volumeChangePct = parseFloat(t.turnover_change_24h ?? 0);
