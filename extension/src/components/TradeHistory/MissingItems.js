import React from 'react';

const MissingItems = (props) => {
  const { numberOfItemsMissing } = props;

  const missingItem = (index) => {
    return (
      <div
        className="row assets__item"
        key={`missing_item_${index}`}
      >
        <div className="col-9">
          <h3 className="assets__name">
            Item Missing Details
          </h3>
        </div>
      </div>
    );
  };

  const missingItemsArray = () => {
    const missingItemsList = [];
    for (let i = 0; i < numberOfItemsMissing; i += 1) {
      missingItemsList.push(missingItem(i));
    }
    return missingItemsList;
  };

  return numberOfItemsMissing !== 0 ? (
    <div className="assets col-md-6">
      <div className="assets__items">
        {
          missingItemsArray()
        }
      </div>
    </div>
  ) : null;
};

export default MissingItems;
