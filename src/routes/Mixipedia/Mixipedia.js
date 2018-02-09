/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Gallery from 'react-grid-gallery';
import rp from 'request-promise';

import history from '../../history';

const Title = styled.h5`
  text-align: center;
`;

const Container = styled.div`
  box-sizing: border-box;
  margin: 30px auto;
  background-color: white;
  width: 80vw;
  height: calc(100vh - 180px);
  height: -o-calc(100vh - 180px); /* opera */
  height: -webkit-calc(100vh - 180px); /* google, safari */
  height: -moz-calc(100vh - 180px); /* firefox */
  overflow-y: auto;
`;

class Mixipedia extends React.Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      postInProgress: false
    };
  }

  componentDidMount() {
    this.getAnimals();
    this.addScrollListener();
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  removeScrollListener() {
    const container = ReactDOM.findDOMNode(this.refs.container);
    container.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  addScrollListener() {
    const container = ReactDOM.findDOMNode(this.refs.container);
    container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll(event) {
    if (this.isBottom() && !this.state.postInProgress) {
      this.setState({ postInProgress: true });
      this.getAnimals(true).then(resp => {
        this.setState({ postInProgress: false });
      });
    }
  }

  isBottom() {
    const container = ReactDOM.findDOMNode(this.refs.container);
    return (
      container.scrollTop === container.scrollHeight - container.offsetHeight
    );
  }

  getImageUrl(appendImages) {
    let limit = 12;
    let url = 'http://localhost:5000/animixer-1d266/us-central1/api/mixipedia';
    if (appendImages && this.state.images.length > 0) {
      let lastImage = this.state.images[this.state.images.length - 1];
      url +=
        '?limit=' + (limit + 1) + '&start=' + lastImage.data.date_found_inv;
    } else {
      url += '?limit=' + limit;
    }
    return url;
  }

  /**
   * Get enough found animals to fill the screen
   */
  getAnimals(appendImages) {
    appendImages = appendImages || false;
    let postOptions = {
      uri: this.getImageUrl(appendImages),
      resolveWithFullResponse: true,
      json: true
    };
    // make API call to get animals
    return rp(postOptions).then(resp => {
      let imagesData = resp.body;
      let imageKeys = Object.keys(imagesData);
      let images = imageKeys.map(function(imageKey) {
        let image = imagesData[imageKey];
        return {
          src: image.gif_url,
          thumbnail: image.gif_url,
          thumbnailWidth: 320,
          thumbnailHeight: 174,
          thumbnailCaption: image.name,
          caption: image.name,
          data: image
        };
      });

      if (appendImages) {
        if (images.length > 1) {
          let existingImages = this.state.images;
          images = images.reverse();
          images.shift();
          this.setState({
            images: existingImages.concat(images)
          });
        }
      } else {
        this.setState({
          images: images.reverse()
        });
      }
    });
  }

  clickThumbnail(index) {
    let imageData = this.props.item;
    let url =
      '/animal?animal1=' +
      imageData.data.animal1 +
      '&animal2=' +
      imageData.data.animal2 +
      '&animal3=' +
      imageData.data.animal3;
    history.push(url);
  }

  render() {
    return (
      <Container ref="container">
        <Title>Discovered Animals</Title>
        <Gallery
          images={this.state.images}
          enableImageSelection={false}
          enableLightbox={false}
          onClickThumbnail={this.clickThumbnail}
          ref="gallery"
        />
      </Container>
    );
  }
}

export default Mixipedia;