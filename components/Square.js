import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from "react-navigation";

const Square = (props) => {
    
    return (
        <View style={{width: 12, height: 12, backgroundColor: props.color, borderColor: 'black', borderWidth: 1,}}/>
    )
}
export default Square;