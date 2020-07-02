import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const TwoDotFive = () => {
  return  (
    <ReleaseNote
      version="2.5"
      title="Trade history and export"
      video="https://www.youtube.com/embed/pc5HmASSfbE"
    >
      <p>
        This version includes countless bug fixes and smaller improvements, but what I want to show you is the trade history and export feature.
        In the extension menu you will find a new Trade history submenu with two new pages.
      </p>
      <ShowcaseImage src='/img/release-notes/trade_history_header.png' title='Trade history header'/>
      <p>
        In the Trade History menu you can navigate through your trade history at a breeze.
        See prices, links to items and profit/loss as well as a P/L summary.
      </p>
      <ShowcaseImage src='/img/release-notes/trade_history_export.png' title='Trade History Export'/>
      <p>
        Under Trade History Export you can select a date range and export your trade history in a .CSV format.
        You can analyze it once you loaded it into Excel or your choice of software.
      </p>
      <ShowcaseImage src='/img/release-notes/trade_history_export_excel.png' title='Trade History Export Excel'/>
    </ReleaseNote>
  );
};

export default TwoDotFive;