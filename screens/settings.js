import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";

export default class SettingsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            isTimerDisabled: false,
            inspection: false,

            backgroundColor: '#303030',
            accentColor: '#007fff',
            
            defaultBackgroundColor: '#303030',
            defaultAccentColor: '#007fff',

            backgroundModalVisible: false,
            accentModalVisible: false,

            picker: null,
        };

        this._loadToggles();
    }

    _loadToggles = async () => {
        const value = await AsyncStorage.getItem("isTimerDisabled");
        if (value == "true") { this.setState({ isTimerDisabled: true }); }
    }

    componentWillUnmount(){
        
    }

    toggleTimerDisableSwitch = () => {
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

    ToggleInspectionSwitch = () => {
        if (this.state.inspection)
        {
            this.setState({inspection: false});
            this.storeData("inspection", "false")
        }
        else
        {
            this.setState({inspection: true})
            this.storeData("inspection", "true")
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

    setBackgroundModalVisible = (visible, index) => {
        this.setState({ backgroundModalVisible: visible });
    }

    onBackgroundColorChange = (newColor) =>{
        this.setState({backgroundColor: newColor});
    }

    setAccentModalVisible = (visible, index) => {
        this.setState({ accentModalVisible: visible });
    }

    onAccentColorChange = (newColor) =>{
        this.setState({accentColor: newColor});
    }


    render(){
        const { navigate } = this.props.navigation;
        const { backgroundModalVisible } = this.state;
        const { accentModalVisible } = this.state;
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: this.state.backgroundColor}]}>
                <StatusBar style="auto" />

                <View style={styles.settings}>
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
                    <View style={styles.settingWrapper}>
                        <Text style={styles.settingText}>
                            Enable Inspection
                        </Text>
                        <Switch style={styles.switch} 
                            trackColor={{ false: "black", true: "lime" }}
                            thumbColor={this.state.inspection ? "green" : "red"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={this.ToggleInspectionSwitch}
                            value={this.state.inspection}
                        />
                    </View>
                </View>


                <View style={[styles.pageNavigator, {backgroundColor: this.state.accentColor}]}>
                    <TouchableOpacity>
                        <Image style={styles.pagesButtonClicked} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
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
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
    settings: {
        top: '5%',
        margin: 10,
    },
    settingWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: 350,
        backgroundColor: 'darkgray',
        margin: 10,
        height: 60,
    },
    backgroundColorSquare: {
        width: 50, 
        height: 25,
        borderColor: 'black',
        borderWidth: 1,
    },
    accentColorSquare: {
        width: 50, 
        height: 25,
        borderColor: 'black',
        borderWidth: 1,
    },
    modalView: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    colorPicker: {
        
    },
});