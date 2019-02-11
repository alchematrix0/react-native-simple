import React from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, Button, FlatList } from 'react-native';
import ListItem from './components/ListItem.js';
import { getSuggestions } from './autocompleteSuggestions.js';

let kickboxKey = 'test_e82a15c9fa474b23293360bfc25b801d1c2982f8ce10cb8a341ffe8cc1a3cd85';
const kickboxSuggestions = {
  invalid_email: "Specified email is not a valid email address syntax",
  invalid_domain: "Domain for email does not exist",
  rejected_email: "Email address was rejected by the SMTP server, email address does not exist",
};

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      canSubmit: false,
      isValid: false,
      suggestions: [],
      issue: false,
      error: false,
      loading: false,
      apiCallSuccess: false,
    }
  }
  // handle text input, if no @ symbol, assume they are still working, otherwise use reg ex to ensure only allowed chars are present
  onChange = (email) => {
    this.setState({email}, () => {
      if (this.state.email.includes('@')) {
        let i = this.state.email.indexOf('@')
        let suggestions = getSuggestions(this.state.email.slice(0, i), this.state.email.slice(i + 1))
        let canSubmit = this.state.email.split("").every(char => /([A-Z]|[a-z]|[\.]|[/d]|[\-]|[\_]|[@])/g.test(char))
        this.setState({suggestions, canSubmit, issue: !canSubmit ? 'Illegal characters detected. Please only use letters, numbers and these symbols: [-, _, @, .]' : false})
      }
    })
  }
  assignEmailFromSuggestion = (email) => this.setState({email, canSubmit: true})
  // aync API call to kickbox, returns objecrt with details about this email's ability to open an SMTP connection
  kickbox = async () => {
    try {
      let kickboxSays = await fetch(`https://api.kickbox.com/v2/verify?email=${this.state.email}&apikey=${kickboxKey}`)
      return await kickboxSays.json()
    } catch (err) {
      console.error(err)
      return new Error(err.message)
    }
  }
  // user presses submit, send their input to kickbox for validation and report back to the user
  handleSubmit = () => {
    this.setState({loading: true})
    this.kickbox()
    .then(kbRes => {
      this.setState({
        loading: false,
        apiCallSuccess: kbRes.success,
        isValid: ['deliverable', 'risky'].includes(kbRes.result),
        kbResut: kbRes.result,
        issue: kickboxSuggestions[kbRes.reason],
        error: false,
        suggestions: kbRes.did_you_mean ? [kbRes.did_you_mean] : []
      }, () => console.log(this.state))
    })
    .catch(error => this.setState({loading: false, apiCallSuccess: false, error: error.message}))
  }
  render() {
    return (
      <ScrollView
        keyboardShouldPersistTaps='always'
        contentContainerStyle={{alignItems: 'center', justifyContent: 'flex-start'}}
        style={styles.container}
      >
        <View style={{width: '100%', height: 80, padding: 50, backgroundColor: '#ff5722'}}>
          <Text style={{color: 'white', fontSize: 16}}>Invoice Simple Email Project</Text>
        </View>
        <View style={styles.view}>
          <TextInput
            autoFocus={true}
            autoCorrect={false}
            autoCapitalize='none'
            style={styles.input}
            underlineColorAndroid={this.state.canSubmit ? '#428AF8' : 'red'}
            keyboardType='email-address'
            textContentType='emailAddress'
            placeholder='Please enter your email'
            onChangeText={(email) => this.onChange(email)}
            value={this.state.email}
          />
          {!this.state.isValid ? (
            <Button
              title={this.state.loading? '...' : 'Submit'}
              color='blue'
              disabled={!this.state.canSubmit}
              onPress={this.handleSubmit}
              style={{flex: 1}}
            />) : (<Text>Thank you! Your email is utterly perfect.</Text>)}
        </View>
        {this.state.issue && (
          <View style={styles.view}>
            <Text>{this.state.issue}</Text>
          </View>
        )}
        {this.state.error && (
          <View style={styles.view}>
            <Text>{this.state.error}</Text>
          </View>
        )}
        {/* For some reason, need to also set keyboardShouldPersistTaps here and not just on the parent ScrollView */}
        <ScrollView keyboardShouldPersistTaps='always' style={styles.view}>
          <FlatList
            keyboardShouldPersistTaps='always'
            data={this.state.suggestions}
            renderItem={({item}) => <ListItem onPressItem={this.assignEmailFromSuggestion.bind(null, item)} email={item} style={styles.item} />}
            keyExtractor={(key, index) => `${key}${index}`}
          />
        </ScrollView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    margin: 12,
  },
  item: {
    padding: 20,
    fontSize: 18,
    height: 44,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  input: {
    height: 40,
    width: 300,
    paddingLeft: 6,
    paddingBottom: 12
  }
});
