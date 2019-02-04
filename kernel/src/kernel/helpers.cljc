(ns kernel.helpers
  "Host-specific helper functions.

  Utilizes reader conditionals to provide different code when compiling
  as Clojure (:clj) and ClojureScript (:cljs)."
  #?@(:clj  [(:import (java.util UUID)
                      [java.io ByteArrayInputStream ByteArrayOutputStream])
             (:require [cognitect.transit :as transit])]
      :cljs [(:require [cognitect.transit :as transit])]))

(defn generate-ID
  "Identifiers generated in the system must be unique.
  For simplicity, we utilize pseudo randomly generated UUIDs (version 4).
  The probability for a collision is very small (50% if 1 billion
  UUIDs are generated per second for about 85 years).
  **TODO**: Generate identifiers from JavaScript."
  []
  #?(:clj  (-> (UUID/randomUUID) .toString)
     :cljs "<insert ID generation code here>"))

(defn encode [data]
  #?(:clj  (let [out (ByteArrayOutputStream. 4096)
                 writer (transit/writer out :json)]
             (transit/write writer data)
             (.toString out))
     :cljs (let [writer (transit/writer :json)]
                (transit/write writer data))))

(defn decode [str]
  #?(:clj  (let [in (ByteArrayInputStream. (.getBytes str))
                 reader (transit/reader in :json)]
             (transit/read reader))
     :cljs (let [reader (transit/reader :json)]
                (transit/read reader str))))