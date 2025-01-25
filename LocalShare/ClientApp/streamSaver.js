function createWriteStream(fileTransferMetadata) {
    navigator.serviceWorker.controller.postMessage({fileTransferMetadata});
    let metadataBroadcast = new BroadcastChannel("metadata");
    let chunkBroadcast = new BroadcastChannel("chunk");
    let downloadUrl = null;
    let bytesWritten = 0;

    metadataBroadcast.onmessage = (event) => {
        if (event.data.download) {
            if (bytesWritten) {
                const atag = document.createElement('a');
                atag.href = event.data.download;
                atag.click();
                // location.href = event.data.download
            } else {
                downloadUrl = event.data.download
            }
        }

        // if (event.data.error) {
        //     console.error(event.data.error);
        //     return;
        // }
        //
        // if (event.data.done) {
        //     broadcast.close();
        //     return;
        // }
        //
        // if (event.data.chunkData) {
        //     const chunk = new Uint8Array(event.data.chunkData);
        //     channel.port1.postMessage(chunk);
        //     bytesWritten += chunk.length;
        // }
    }

    return new WritableStream({
        write(chunk) {
            if (!(chunk instanceof Uint8Array)) {
                throw new TypeError('Can only write Uint8Arrays')
            }
            chunkBroadcast.postMessage({chunkData: chunk})
            bytesWritten += chunk.length
            if (bytesWritten === fileTransferMetadata.size) {
                chunkBroadcast.postMessage({done: true})
            }

            if (downloadUrl) {

                const atag = document.createElement('a');
                atag.href = event.data.download;
                atag.click();
                downloadUrl = null
            }
        }
    })
}

// class WritableChunkStream {
//     write(chunk) {
//         if (!(chunk instanceof Uint8Array)) {
//             throw new TypeError('Can only write Uint8Arrays')
//         }
//         channel.port1.postMessage(chunk)
//         bytesWritten += chunk.length
//
//         if (downloadUrl) {
//             location.href = downloadUrl
//             downloadUrl = null
//         }
//     }
// }