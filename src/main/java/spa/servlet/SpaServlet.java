package spa.servlet;

import java.io.IOException;
import java.io.PrintWriter;
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

    private static final Logger logger = Logger.getLogger("spa");

    private SpaContext context;
    private ServiceListener listener;

    private String packagePathPrefix;

    private String[] clientResources = {
        "/__init__.js",
        "/service/__init__.js",
        "/service/__init_client__.js",
        "/view/__init__.js",
        "/ui/__init__.js"
    };

    private String[] serverResources = {
        "/__init__.js",
        "/util/__init__.js",
        "/service/__init__.js",
        "/service/__init_server__.js"
    };

    @Override
    public void init(ServletConfig config) throws ServletException {

        super.init(config);

        // fixed.
        packagePathPrefix = "/spa";

        ScriptEngine se = new ScriptEngineManager().
                getEngineByName("javascript");
        context = new SpaContext(se);
        se.put("_ctx", context);
        se.put("_logger", logger);

        try {
            for (String res : serverResources) {
                context.evalfile(packagePathPrefix + res);
            }
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
            context.evalfile(packagePathPrefix +
                    "/service/__init_server__.js");
        } catch(Exception e) {
            throw new ServletException(e);
        }

        if ("/client.js".equals(request.getPathInfo() ) ) {
            response.setContentType("text/javascript;charset=UTF-8");
            PrintWriter out = response.getWriter();
            try {
                for (String res : clientResources) {
                    out.println(context.getResourceAsString(
                            packagePathPrefix + res) );
                }
                out.println("spa.__context_path__ = \"" +
                        request.getContextPath() + "\";");
                out.println("spa.__servlet_path__ = \"" +
                        request.getServletPath() + "\";");
            } finally {
                out.close();
            }
        } else {
            listener.service(request, response);
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
