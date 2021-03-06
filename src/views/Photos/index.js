import MarkerClusterer from '@google/markerclustererplus'
import React from 'react'
import Map from 'components/Map'
import Masonry from 'components/Masonry'
import Modal from 'components/Modal'
import { Caption } from 'components/styles'
import { Img, Thumbnail } from './styles'

const Icon = color => `
  <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <circle cx="120" cy="120" opacity=".6" r="70" />
    <circle cx="120" cy="120" opacity=".4" r="95" />
    <circle cx="120" cy="120" opacity=".2" r="120" />
  </svg>`

const addMarkers = ({ photos, setModal }) => map => {
  const markers = photos.map(({ caption, lat, lng }, index) => {
    const marker = new window.google.maps.Marker({
      map,
      position: { lat, lng },
      label: `${index + 1}`,
      title: caption,
    })
    marker.addListener(`click`, () => setModal(index))
    return marker
  })
  new MarkerClusterer(map, markers, {
    styles: [`blue`, `green`, `red`].map(color => ({
      url: `data:image/svg+xml;utf-8,${Icon(color)}`,
      height: 30,
      width: 30,
      textColor: `whitesmoke`,
    })),
  })
}

export default function Photos({ tab, photos, modal, setModal }) {
  const currentPhoto = modal >= 0 && modal < photos.length && photos[modal]
  return (
    <>
      {tab === `list` ? (
        <Masonry>
          {photos.map((photo, index) => (
            <div onClick={() => setModal(index)} key={photo.caption}>
              <Thumbnail alt={photo.caption} fluid={photo.fluid} />
            </div>
          ))}
        </Masonry>
      ) : (
        <Map
          options={{ center: { lat: 40, lng: 10 }, zoom: 3, disableDefaultUI: true }}
          onMount={addMarkers}
          onMountProps={{ photos, setModal }}
          css="height: 75vh;"
        />
      )}
      <Modal
        open={currentPhoto}
        {...{ modal, setModal }}
        whiteControls
        fullScreenDefault
        showArrows
        css="background: black; overflow: hidden;"
      >
        <Img
          alt={currentPhoto.caption}
          fluid={currentPhoto.fluid}
          imgStyle={{ objectFit: `contain` }}
          css="height: 100%;"
        />
        <Caption>
          <h3 css="margin: 0;">{currentPhoto.caption}</h3>
        </Caption>
      </Modal>
    </>
  )
}
