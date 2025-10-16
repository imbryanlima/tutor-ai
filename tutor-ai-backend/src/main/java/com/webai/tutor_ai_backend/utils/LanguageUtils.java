package com.webai.tutor_ai_backend.utils;

import com.cybozu.labs.langdetect.Detector;
import com.cybozu.labs.langdetect.DetectorFactory;

public class LanguageUtils {

    static {
        try {
            DetectorFactory.loadProfile("profiles"); 
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static boolean isEnglish(String text) {
        try {
            Detector detector = DetectorFactory.create();
            detector.append(text);
            return detector.detect().equals("en");
        } catch (Exception e) {
            return false;
        }
    }
}