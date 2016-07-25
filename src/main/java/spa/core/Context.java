package spa.core;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.net.URL;

import javax.script.ScriptEngine;
import javax.script.ScriptException;

public class Context {

    private static final String UTF_8 = "UTF-8";

    private ScriptEngine se;

    public Context(ScriptEngine se) {
        this.se = se;
    }

    public URL getResource(String path) throws IOException {
        return getClass().getResource(path);
    }

    public Object evalfile(String path) throws IOException, ScriptException {
        URL url = getResource(path);
        if (url == null) {
            throw new NullPointerException("not found:" + path);
        }
        Reader in = new InputStreamReader(
                new BufferedInputStream(url.openStream() ), UTF_8);
        try {
            se.put(ScriptEngine.FILENAME, path);
            return se.eval(in);
        } finally {
            in.close();
        }
    }

    public String getResourceAsString(String path) throws IOException {
        URL url = getResource(path);
        if (url == null) {
            throw new NullPointerException("not found:" + path);
        }
        Reader in = new InputStreamReader(
                new BufferedInputStream(url.openStream() ), UTF_8);
        try {
            int c;
            StringBuilder buf = new StringBuilder();
            while ( (c = in.read() ) != -1) {
                buf.append( (char)c);
            }
            return buf.toString();
        } finally {
            in.close();
        }
    }

    public void writeString(File file, String s) throws IOException {
        OutputStream out = new BufferedOutputStream(
                new FileOutputStream(file) );
        try {
            out.write(s.getBytes(UTF_8) );
        } finally {
            out.close();
        }
    }

    public String readString(File file) throws IOException {
        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        InputStream in = new BufferedInputStream(new FileInputStream(file) );
        try {
            byte[] buf = new byte[4096];
            int len;
            while ( (len = in.read(buf) ) != -1) {
                bout.write(buf, 0, len);
            }
        } finally {
            in.close();
        }
        bout.close();
        return new String(bout.toByteArray(), UTF_8);
    }
}
