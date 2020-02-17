import React from "react";

import Category from "../Category/Category";
import Row from "../Row";

const popup = () => {
  return (
    <Category title="Popup">
      <Row
        name="Links to show"
        type="linksToShow"
        id="popupLinks"
        description="Choose which links you want to see in the popup. 'Options' will always be there so you can come back and see this page. Links to be shown are in gold, links to be hidden are in white. Click it to switch visibility. You can also delete those that you have created before."
      />
    </Category>
  );
};

export default popup;
