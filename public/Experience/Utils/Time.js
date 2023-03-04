import EventEmitter from './EventEmitter.js'

export default class Time extends EventEmitter
{
    constructor()
    {
        super()

        // Setup
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16
        this.ticks = 0

        window.requestAnimationFrame(() =>
        {
            this.tick()
        })
    }

    reset(){
        this.start = Date.now()
        this.current = this.start
        this.ticks = 0
        this.elapsed = 0
        this.delta = 16
    }

    tick()
    {
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start
        this.ticks += 1

        this.trigger('tick')

        window.requestAnimationFrame(() =>
        {
            this.tick()
        })
    }
}