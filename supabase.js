// Clean Local Supabase Setup Client Bundle
(function (global) {
    'use strict';

    // Fallback Mock Client structure to handle initial definitions securely
    var supabaseObject = {
        createClient: function (url, key) {
            return {
                auth: {
                    onAuthStateChange: function (callback) {
                        // Safe tracking mock framework wrapper
                        var session = localStorage.getItem('sb-session') ? JSON.parse(localStorage.getItem('sb-session')) : null;
                        setTimeout(function() { callback('INITIAL', session); }, 100);
                    },
                    signInAnonymously: async function (options) {
                        var username = options?.options?.data?.username || 'Guest';
                        var mockSession = { user: { id: 'anon-' + Math.random().toString(36).substr(2, 9), user_metadata: { username: username } } };
                        localStorage.setItem('sb-session', JSON.stringify(mockSession));
                        window.location.reload();
                        return { data: mockSession, error: null };
                    },
                    signOut: async function () {
                        localStorage.removeItem('sb-session');
                        window.location.reload();
                        return { error: null };
                    }
                },
                from: function (tableName) {
                    return {
                        select: function () {
                            return {
                                eq: function (col, val) {
                                    return {
                                        order: function (sortCol, sortOpt) {
                                            return this;
                                        },
                                        then: async function (resolve) {
                                            // Dynamic database handler fetch route
                                            try {
                                                var targetUrl = url + "/rest/v1/" + tableName + "?" + col + "=eq." + encodeURIComponent(val) + "&select=*&order=created_at.desc";
                                                var res = await fetch(targetUrl, {
                                                    method: 'GET',
                                                    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
                                                });
                                                var data = await res.json();
                                                resolve({ data: data, error: null });
                                            } catch(err) {
                                                resolve({ data: null, error: err });
                                            }
                                        }
                                    };
                                }
                            };
                        },
                        insert: function (payloadArray) {
                            return {
                                then: async function (resolve) {
                                    try {
                                        var targetUrl = url + "/rest/v1/" + tableName;
                                        var res = await fetch(targetUrl, {
                                            method: 'POST',
                                            headers: { 
                                                'apikey': key, 
                                                'Authorization': 'Bearer ' + key,
                                                'Content-Type': 'application/json',
                                                'Prefer': 'return=representation'
                                            },
                                            body: JSON.stringify(payloadArray)
                                        });
                                        var data = await res.json();
                                        resolve({ data: data, error: null });
                                    } catch(err) {
                                        resolve({ data: null, error: err });
                                    }
                                }
                            };
                        }
                    };
                }
            };
        }
    };

    // Export cleanly to global window architecture wrapper scope
    global.supabase = supabaseObject;

})(typeof window !== 'undefined' ? window : this);
