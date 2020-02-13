import React from "react";

import FlipSwitchStorage from "./Inputs/FlipSwitchStorage/FlipSwitchStorage";
import FlipSwitchPermission from "./Inputs/FlipSwitchPermission/FlipSwitchPermission";
import ModalTextBox from "./Inputs/ModalTextBox/ModalTextBox";
import Select from "./Inputs/Select/Select";

function typeSwitch(type, key, permission, origins, modalTitle) {
  switch (type) {
    case "flipSwitchStorage":
      return <FlipSwitchStorage id={key} />;
    case "modalTextBox":
      return <ModalTextBox id={key} modalTitle={modalTitle} />;
    case "flipSwitchPermission":
      return (
        <FlipSwitchPermission
          id={key}
          permission={permission}
          origins={origins}
        />
      );
    case "select":
      return <Select id={key} />;
    default:
      return null;
  }
}

const row = props => {
  return (
    <tr>
      <td>{props.name}</td>
      <td>
        {typeSwitch(
          props.type,
          props.id,
          props.permission,
          props.origins,
          props.modalTitle
        )}
      </td>
      <td>{props.description}</td>
    </tr>
  );
};

export default row;
