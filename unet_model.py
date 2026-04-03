import tensorflow as tf
from tensorflow.keras import layers, models

def unet_model(input_size=(128, 128, 1)):

    inputs = layers.Input(input_size)

    # Encoder
    c1 = layers.Conv2D(64, 3, activation='relu', padding='same')(inputs)
    c1 = layers.Conv2D(64, 3, activation='relu', padding='same')(c1)
    p1 = layers.MaxPooling2D()(c1)

    c2 = layers.Conv2D(128, 3, activation='relu', padding='same')(p1)
    c2 = layers.Conv2D(128, 3, activation='relu', padding='same')(c2)
    p2 = layers.MaxPooling2D()(c2)

    # Bottleneck
    c3 = layers.Conv2D(256, 3, activation='relu', padding='same')(p2)
    c3 = layers.Conv2D(256, 3, activation='relu', padding='same')(c3)

    # Decoder
    u1 = layers.UpSampling2D()(c3)
    u1 = layers.concatenate([u1, c2])
    c4 = layers.Conv2D(128, 3, activation='relu', padding='same')(u1)

    u2 = layers.UpSampling2D()(c4)
    u2 = layers.concatenate([u2, c1])
    c5 = layers.Conv2D(64, 3, activation='relu', padding='same')(u2)

    # Output
    outputs = layers.Conv2D(1, 1, activation='sigmoid')(c5)

    model = models.Model(inputs, outputs)

    return model

if __name__ == "__main__":
    model = unet_model(input_size=(128, 128, 1))
    model.compile(optimizer='adam',
                  loss='binary_crossentropy',
                  metrics=['accuracy'])

    model.summary()

    # simple self-test with dummy data to confirm runtime behavior
    import numpy as np
    x = np.random.rand(2, 128, 128, 1).astype(np.float32)
    y = np.random.randint(0, 2, size=(2, 128, 128, 1)).astype(np.float32)

    print("Starting a single prediction pass on synthetic data...")
    try:
        preds = model.predict(x, batch_size=1, verbose=0)
        print("Prediction completed. Output shape:", preds.shape)
    except Exception as e:
        print("Prediction failed with error:", e)
    finally:
        tf.keras.backend.clear_session()
