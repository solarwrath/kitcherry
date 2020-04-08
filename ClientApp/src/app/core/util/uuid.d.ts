import {v1String, v3String, v4String, v5String} from "uuid/interfaces";

//We serialize UUID in the form of string but uuid methods return special types,
//so it is nice to union them
type UUID = string | v1String | v3String | v4String | v5String;
export default UUID;
