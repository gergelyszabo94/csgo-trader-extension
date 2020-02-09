import React, {Fragment} from "react";
import Category from "./Category/Category";
import GeneralSchema from "./optionsSchemas/general";

const options = props => {
    return (
        <Fragment>
            <h1>CSGO Trader Options</h1>
            <Category schema={GeneralSchema}/>
        </Fragment>
    );
};

export default options;