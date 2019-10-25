import { getRange, multivariateNormalDiag } from 'utils/math'
import chain, { xChain, yChain } from './bimodalChain'

const bimodal = (x, y) =>
  multivariateNormalDiag([0, 0], [1, 1])([x, y]) +
  multivariateNormalDiag([4, 4], [1, 1])([x, y])

const range = getRange(-3, 8.1, 0.3)
const z = range.map(x => range.map(y => bimodal(x, y)))

export default {
  data: [
    {
      z,
      x: range,
      y: range,
      type: `surface`,
      scene: `scene1`,
      contours: {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: `white`,
          project: { z: true },
        },
      },
      showscale: false,
    },
    {
      ...{ z: chain.map(el => bimodal(...el)), x: xChain, y: yChain },
      type: `scatter3d`,
    },
  ],
  style: { height: `30em` },
  layout: {
    scene1: {
      camera: {
        eye: {
          x: 1.3,
          y: -1.3,
          z: 0.5,
        },
      },
    },
  },
}
