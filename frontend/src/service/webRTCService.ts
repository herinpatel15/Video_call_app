class WebRTCService {

    public peer: RTCPeerConnection | undefined

    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            })
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer)
            const ans = await this.peer.createAnswer()
            await this.peer.setLocalDescription(new RTCSessionDescription(ans))
            return ans
        }
    }

    async setLocalDescription(ans: RTCSessionDescriptionInit) {
        if (this.peer) {
            if (this.peer.signalingState === "have-remote-offer" || this.peer.signalingState === "stable") {
                await this.peer.setLocalDescription(new RTCSessionDescription(ans))
            } else {
                console.error("Cannot set local description, current signaling state: ", this.peer.signalingState);
            }
        }
    }

    async setRemoteDescription(ans: RTCSessionDescriptionInit) {
        if (this.peer) {
            if (this.peer.signalingState === "have-local-offer") {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            } else {
                console.error("Cannot set remote description, current signaling state: ", this.peer.signalingState);
            }
        }
    }

    // async setRemoteDescription(ans: RTCSessionDescriptionInit) {
    //     if (this.peer) {
    //         await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    //     }
    // }
}

export default new WebRTCService()