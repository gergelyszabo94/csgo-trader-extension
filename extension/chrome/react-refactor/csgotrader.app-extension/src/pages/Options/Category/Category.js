import React from "react";
import { Table } from 'react-bootstrap';

const category = (props) => {
    return (
        <div className="buildingBlock">
            <h2>{props.schema.title}</h2>
            <Table striped>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {
                    props.schema.options.map(option => {
                      return (
                          <tr key={option.storageKey}>
                              <td>{option.name}</td>
                              <td>{option.inputType}</td>
                              <td>{option.description}</td>
                          </tr>
                      )
                    })
                }
                </tbody>
            </Table>
        </div>
    );
};

export default category;
