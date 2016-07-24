package spa.servlet;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.util.logging.Logger;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import spa.core.Context;

@SuppressWarnings("serial")
public class SpaServlet extends HttpServlet {

    private final Logger logger = Logger.getLogger("spa");

    private SpaContext context;
    private ServiceListener listener;

    private String[] resources = {
        "/spa/view/__init__.js",
        "/spa/service/__init__.js",
        "/spa/service/__init_client__.js",
        "/spa/ui/__init__.js"
    };

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);

        ScriptEngine se = new ScriptEngineManager().
                getEngineByName("javascript");
        context = new SpaContext(se);
        se.put("_ctx", context);
        se.put("_logger", logger);

        try {
            context.evalfile("/spa/service/__init__.js");
        } catch(Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void service(
        final HttpServletRequest request,
        final HttpServletResponse response
    ) throws ServletException, IOException {

        try {
            context.evalfile("/spa/service/__init_server__.js");
        } catch(Exception e) {
            throw new ServletException(e);
        }

        if ("/client.js".equals(request.getPathInfo() ) ) {
            response.setContentType("text/javascript;charset=UTF-8");
            PrintWriter out = response.getWriter();
            try {
                for (String res : resources) {
                    outputResource(out, res);
                }
            } finally {
                out.close();
            }
        } else {
            listener.service(request, response);
        }
    }

    protected void outputResource(PrintWriter out, String path)
    throws IOException {
        Reader in = new InputStreamReader(new BufferedInputStream(
                context.getResource(path).openStream() ),
                "UTF-8");
        try {
            char[] buf = new char[4096];
            int len;
            while ( (len = in.read(buf) ) != -1) {
                out.write(buf, 0, len);
            }
        } finally {
            in.close();
        }
    }

    public class SpaContext extends Context {
        public SpaContext(ScriptEngine se) {
            super(se);
        }
        public void setServiceListener(ServiceListener listener) {
            SpaServlet.this.listener = listener;
        }
    }
}
