import * as React from 'react'
import { render } from 'react-dom'
import Benchmark from 'benchmark'

// import 'lodash'

// const Benchmark = require('benchmark')

window['Benchmark'] = Benchmark

const teardown = () => {
  const root = document.querySelector('#example')
  document.body.removeChild(root)
}

const setup = () => {
  const root = document.querySelector('#example')
  console.info(root, 1)
  const el = document.createElement('div')
  el.id = 'example'
  // debugger
  console.info(document.body)
  document.body.appendChild(el)
}

const sample = () => {
  1 * 1
}

const bench = new Benchmark('React.render', sample, {

  // displayed by `Benchmark#toString` if `name` is not available
  'id': 'xyz',

  // compiled/called before the test loop
  'setup': setup,

  // compiled/called after the test loop
  'teardown': teardown,
  'onComplete': function() {
    console.info(this)
  }
})

bench.run()

// const suite = new Benchmark.Suite

// // add tests
// suite.add('RegExp#test', sample)
// // // .on('teardown', teardown)
// .on('start', setup)
// // .on('complete', function() {
// //   console.info('Fastest is ' + this.filter('fastest').map('name'))
// // })
// // // run async
// .run({ 'async': false })
