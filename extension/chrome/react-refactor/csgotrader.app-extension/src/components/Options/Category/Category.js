import React from "react";
import { Table } from 'react-bootstrap';

const category = (props) => {
    return (
        <div className="buildingBlock">
            <h2>{props.title}</h2>
            {props.subTitle !== undefined ? <p>{props.subTitle}</p> : null}
            <Table striped>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {props.children}
                </tbody>
            </Table>
        </div>
    );
};

export default category;
