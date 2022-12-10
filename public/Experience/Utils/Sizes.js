import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    constructor(_canvas)
    {
        super()

        // Setup
        this.width = _canvas.parentNode.clientWidth
        this.height = _canvas.parentNode.clientHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        // Resize event
        window.addEventListener('resize', () =>
        {
            // updates size when there is resize
            this.width = _canvas.parentNode.clientWidth
            this.height = _canvas.parentNode.clientHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)

            this.trigger('resize')
        })
    }
}