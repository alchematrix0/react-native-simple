import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export default class ListItem extends React.PureComponent {
  _onPress = () => this.props.onPressItem(this.props.email);
  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View>
          <Text>{this.props.email}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
