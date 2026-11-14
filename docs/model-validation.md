# DriveSense model integration status

The workspace contains `dataset/driver_behavior_route_anomaly_dataset_with_derived_features.csv` (about 37.6 MB) and no model artifact or training/preprocessing source. The CSV header contains identifiers, timestamps, latitude/longitude, speed, acceleration, steering, braking, route-anomaly, and consistency columns. A header alone does not establish a validated feature contract or which field is an approved training target.

DriveSense therefore does not install/load scikit-learn or joblib, train on the CSV, or return model classifications. The API reports `artifact_missing` unless `DRIVESENSE_MODEL_PATH` points to a file; even then it reports `validation_required` and keeps predictions disabled. It exposes only the artifact's filename, not a local filesystem path.

Before enabling a model, document and validate:

1. Artifact provenance, training code, scikit-learn version, and serialization compatibility.
2. Exact ordered feature names and units, including treatment of identifiers, coordinates, missing values, and timestamps.
3. Preprocessing pipeline and target labels, with evidence that the evaluation split avoids trip/driver leakage.
4. Output semantics and known limitations; any numeric score must not be presented as calibrated accident probability without calibration evidence.
5. A reviewed artifact manifest/schema, reproducible tests, and an explicit model-loading policy.

Do not treat the dataset as a model, use raw GPS coordinates as arbitrary model inputs, or expose a prediction route before that review is complete.
