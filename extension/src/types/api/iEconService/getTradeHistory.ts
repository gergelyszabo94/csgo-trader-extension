export interface TradeHistory {
  total_trades: number;
  more: boolean;
  trades: Trade[];
}

interface Trade {
  tradeid: string;
  steamid_other: string;
  time_init: number;
  status: number;
  assets_received: Assets[];
  assets_given?: Assets[];
  time_escrow_end?: number;
}

interface Assets {
  appid: number;
  contextid: string;
  assetid: string;
  amount: string;
  classid: string;
  instanceid: string;
  new_assetid: string;
  new_contextid: string;
}