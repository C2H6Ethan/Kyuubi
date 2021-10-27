import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";

export default class SettingsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
          isTimerDisabled: false
        };

        this._loadToggles();
    }

    _loadToggles = async () => {
        const value = await AsyncStorage.getItem("isTimerDisabled");
        if (value == "true") { this.setState({ isTimerDisabled: true }); }
    }

    componentWillUnmount(){
        
    }

    toggleTimerDisableSwitch = async () => {
        if (this.state.isTimerDisabled)
        {
            this.setState({isTimerDisabled: false});
            this.storeData("isTimerDisabled", "false")
        }
        else
        {
            this.setState({isTimerDisabled: true})
            this.storeData("isTimerDisabled", "true")
        }
    }

    storeData = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
        } 
        catch (error) {
            console.warn(error);
        }
    }
    
    checkToggles = async () =>{
        try {
            const value = await AsyncStorage.getItem("isTimerDisabled");
            if (value == "true"){
                this.setState ({
                    isTimerDisabled: true,
                })
            }
        } 
        catch (error) {
            console.warn(error)
        }
    }


    render(){
        const { navigate } = this.props.navigation;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="auto" />
                <View style={styles.settingWrapper}>
                    <Text style={styles.settingText}>
                        Disable Timer during Solve
                    </Text>
                    <Switch style={styles.switch} 
                        trackColor={{ false: "black", true: "lime" }}
                        thumbColor={this.state.isTimerDisabled ? "green" : "red"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={this.toggleTimerDisableSwitch}
                        value={this.state.isTimerDisabled}
                    />
                </View>


                <View style={styles.pageNavigator}>
                    <TouchableOpacity>
                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen', {isTimerDisabled: this.state.isTimerDisabled})}>
                        <Image style={styles.pagesButton} source={require('../assets/home.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SolvesScreen')}>
                    <Image style={styles.pagesButton} source={require('../assets/graph.png')}/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gray',
        alignItems: 'center',
        width: "100%",
        justifyContent: "space-between"
    },
    pageNavigator: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: 250,
        backgroundColor: 'dodgerblue' 
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    settingWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        top: 30,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: '90%',
        backgroundColor: 'darkgray' 
    },
    settingText: {},
    switch: {
        transform: [{ scaleX: 1 }, { scaleY: 1 }],
    },
});